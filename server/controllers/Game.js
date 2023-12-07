const models = require('../models');
const LastFm = require('./LastFm');
const MusicBrainz = require('./MusicBrainz');

const { Game, Stats } = models;

const gamePage = (req, res) => {
  res.render('app');
};

const collectValidTopAlbums = async (lastFmUsername) => {
  const validGuesses = [];
  let currentPage = 0;
  let totalPages;

  do {
    /*
     * I've disabled the rule no await in loop here. The intention of the rule
     * is to have async processes run in parallel rather than one at a time.
     * I need them to run in order because I need them to complete in order.
     * This is in line with ESLint's When Not To Use It description for this rule.
     */
    // eslint-disable-next-line no-await-in-loop
    const topAlbumJson = await LastFm.getTopAlbums(lastFmUsername, ++currentPage);
    
    if (topAlbumJson.error) throw new Error(topAlbumJson.error);

    const topAlbums = topAlbumJson.topalbums.album;
    currentPage = topAlbumJson.topalbums['@attr'].page;
    totalPages = topAlbumJson.topalbums['@attr'].totalPages;

    for (let i = 0; i < topAlbums.length; i++) {
      const album = topAlbums[i];
      if (album.mbid !== '') {
        const guess = {
          album: album.name,
          artist: album.artist.name,
          mbid: album.mbid,
        };

        validGuesses.push(guess);
        if (validGuesses.length === 100) break;
      }
    }
  }
  while (currentPage < totalPages && validGuesses.length < 100);

  for (let i = 0; i < validGuesses.length; i++) {
    validGuesses[i].rank = i + 1;
  }

  return validGuesses;
};

const createNewGame = async (req, res) => {
  let validGuesses;
  
  try {
    validGuesses = await collectValidTopAlbums(req.session.account.lastFm);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error fetching game data" });
  }

  const targetIndex = Math.floor(Math.random() * validGuesses.length);
  const targetAlbum = validGuesses[targetIndex];

  const albumInfoParams = [targetAlbum.mbid, targetAlbum.artist, targetAlbum.album];
  
  const targetAlbumInfo = await LastFm.getAlbumInfo(...albumInfoParams);

  if (targetAlbumInfo.error) {
    console.log(targetAlbum.error);
    return res.status(500).json({ error: "Error fetching game data" });
  }

  const mbAlbumInfo = await MusicBrainz.getAlbumInfo(targetAlbum.mbid);

  if (mbAlbumInfo.error) {
    console.log(mbAlbumInfo.error);
    return res.status(500).json({ error: "Error fetching game data" });
  }

  let trackCount;
  try {
    trackCount = targetAlbumInfo.album.tracks.track.length;
  } catch {
    console.log(targetAlbumInfo);
    return res.status(500).json({ error: "Error fetching game data" });
  }

  const target = {
    album: targetAlbum.album,
    artist: targetAlbum.artist,
    trackCount,
    rank: targetAlbum.rank,
    year: mbAlbumInfo.date.split('-')[0],
    mbid: targetAlbum.mbid,
  };

  const gameDoc = {
    target,
    validGuesses,
    maxGuesses: 10,
    owner: req.session.account._id,
  };

  try {
    const newGame = new Game(gameDoc);
    await newGame.save();
    return res.json(Game.toAPI(newGame));
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error fetching game data' });
  }
};

const getData = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const query = { createdDate: { $gte: today }, owner: req.session.account._id };
  const game = await Game.findOne(query);
  if (game === null) {
    return createNewGame(req, res);
  }
  return res.json(Game.toAPI(game));
};

const guess = async (req, res) => {
  const { artist } = req.body;
  const { album } = req.body;
  const { mbid } = req.body;

  if (!artist) { return res.status(400).json({ error: 'artist required' }); }
  if (!album) { return res.status(400).json({ error: 'album required' }); }
  if (!mbid) return res.status(400).json({ error: 'mbid required' });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const query = { createdDate: { $gte: today }, owner: req.session.account._id };
  const game = await Game.findOne(query);

  const {
    target, validGuesses, guesses, hints, actions, maxGuesses, createdDate
  } = game;

  const guessNumber = guesses.length + 1;

  if (guessNumber > maxGuesses) {
    return res.status(403).json({ error: "out of guesses" })
  }

  const guessLastFmInfo = await LastFm.getAlbumInfo(mbid, artist, album);

  const getResult = (targetValue, guessValue) => {
    if (guessValue < targetValue) return 'tooLow';
    if (guessValue > targetValue) return 'tooHigh';
    return 'correct';
  };

  const getCloseness = (targetValue, guessValue, threshold) => {
    const targetValueParsed = parseInt(targetValue, 10);
    const guessValueParsed = parseInt(guessValue, 10);
    if (targetValueParsed === guessValueParsed) return 'correct';
    if (Math.abs(targetValueParsed - guessValueParsed) > threshold) return 'far';
    return 'close';
  };

  const trackCount = guessLastFmInfo.album.tracks.track.length || 1;
  const { rank } = validGuesses.find((g) => (g.artist === artist && g.album === album));

  const guessMusicBrainzInfo = await MusicBrainz.getAlbumInfo(mbid);
  const year = guessMusicBrainzInfo.date.split('-')[0];
  const guessDoc = {
    guessNumber,
    isTarget: rank === target.rank,
    album: guessLastFmInfo.album.name,
    artist: {
      value: guessLastFmInfo.album.artist,
      closeness: await LastFm.getArtistCloseness(target.artist, artist),
    },
    trackCount: {
      value: trackCount,
      result: getResult(target.trackCount, trackCount),
      closeness: getCloseness(target.trackCount, trackCount, 3),
    },
    year: {
      value: year,
      result: getResult(target.year, year),
      closeness: getCloseness(target.year, year, 5),
    },
    rank: {
      value: rank,
      result: getResult(rank, target.rank),
      closeness: getCloseness(target.rank, rank, 5),
    },
    guessesLeft: maxGuesses - guessNumber,
  };

  guesses.push(guessDoc);
  actions.push({
    actionNumber: actions.length + 1,
    action: {
      type: 'guess',
      number: guessNumber,
    },
  });
  game.save();

  if (guessNumber === maxGuesses || rank === target.rank) {
    const statsQuery = { owner: req.session.account._id };
    const stats = await Stats.findOne(statsQuery);

    const { allTime, completedGames } = stats;

    const date = `${createdDate.getFullYear()}-${createdDate.getMonth() + 1}-${createdDate.getDate()}`;
    const outcome = rank === target.rank ? "won" : "lost";

    if (outcome === "won") {
      allTime.wins++;
      allTime.breakdown.find(guessCount => guessCount.guesses === guessNumber).frequency++;
    } else {
      allTime.losses++;
    }

    const completedGame = {
      date,
      target,
      outcome,
      guesses,
      hints,
      actions,
    };

    completedGames.push(completedGame);
    stats.save();
  }

  return res.json(guessDoc);
};

const getTarget = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const query = { createdDate: { $gte: today }, owner: req.session.account._id };
  const game = await Game.findOne(query);

  const {
    target, guesses, maxGuesses,
  } = game;

  if (guesses.length < maxGuesses) {
    // return res.status(403).json({ error: "game still in progress" })
  }

  const targetLastFmInfo = await LastFm.getAlbumInfo(target.mbid, target.artist, target.album);

  const targetDoc = {
    artist: target.artist,
    album: target.album,
    art: targetLastFmInfo.album.image.at(-1)["#text"]
  };

  return res.json(targetDoc);
}

const getStats = async (req, res) => {
  const statsQuery = { owner: req.session.account._id };
  const stats = await Game.findOne(statsQuery);

  return res.json(Stats.toAPI(stats));
}

module.exports = {
  gamePage,
  getData,
  getTarget,
  guess,
  // hint,
  getStats,
};
