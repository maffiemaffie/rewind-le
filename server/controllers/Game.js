const models = require('../models');
const LastFm = require('./LastFm');
const MusicBrainz = require('./MusicBrainz');
const Game = models.Game;

const gamePage = (req, res) => {
    res.render('app');
}

const collectValidTopAlbums = async (lastFmUsername) => {
    const validGuesses = [];
    let currentPage = 0;
    let totalPages;

    do {
        const topAlbumJson = await LastFm.getTopAlbums(lastFmUsername, ++currentPage);
        const topAlbums = topAlbumJson.topalbums.album;
        currentPage = topAlbumJson.topalbums["@attr"].page;
        totalPages = topAlbumJson.topalbums["@attr"].totalPages;


        for (const album of topAlbums) {
            if (album.mbid === '') continue;

            const guess = {
                "album": album.name,
                "artist": album.artist.name,
                "mbid": album.mbid,
            };

            validGuesses.push(guess);
            if (validGuesses.length === 100) break;
        }
    }
    while (currentPage < totalPages && validGuesses.length < 100);

    validGuesses.forEach((guess, rank) => {
        guess.rank = rank + 1;
    })

    return validGuesses;
}

const createNewGame = async (req, res) => {
    const validGuesses = await collectValidTopAlbums(req.session.account.lastFmAccount);
    
    // validGuesses = topAlbums.topalbums.album.map(album => {
    //     const guess = { 
    //         "album": album.name, 
    //         "artist": album.artist.name,
    //     };

    //     if (album.mbid !== '') guess.mbid = album.mbid;

    //     return guess;
    // });

    const targetIndex = Math.floor(Math.random() * validGuesses.length);
    const targetAlbum = validGuesses[targetIndex];

    const targetAlbumInfo = await LastFm.getAlbumInfo(targetAlbum.mbid);
    const mbAlbumInfo = await MusicBrainz.getAlbumInfo(targetAlbum.mbid);

    const target = {
        "album": targetAlbum.album,
        "artist": targetAlbum.artist,
        "trackCount": targetAlbumInfo.album.tracks.track.length,
        "rank": targetAlbum.rank,
        "year": mbAlbumInfo.date.split('-')[0],
        "mbid": targetAlbum.mbid,
    };
    
    const gameDoc = {
        target,
        validGuesses,
        "maxGuesses": 10,
        "owner": req.session.account._id,
    };

    try {
        const newGame = new Game(gameDoc);
        await newGame.save();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error fetching game data' });
    }
}

const getData = async(req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const query = {createdDate: { $gte: today }, owner: req.session.account._id};
    let game = await Game.findOne(query);
    if (game === null) {
        await createNewGame(req, res);
        game = await Game.findOne(query);
    }

    res.status(200).json(Game.toAPI(game));
}

const guess = async (req, res) => {
    const artist = req.body.artist;
    const album = req.body.album;
    const mbid = req.body.mbid;

    if (!artist) 
    return res.status(400).json({ error: 'artist required' });
    if (!album) 
    return res.status(400).json({ error: 'album required' });
    if (!mbid)
    return res.status(400).json({ error: 'mbid required' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const query = {createdDate: { $gte: today }, owner: req.session.account._id};
    const game = await Game.findOne(query);
    const {target, validGuesses, guesses, maxGuesses} = game;

    const guessLastFmInfo = await LastFm.getAlbumInfo(mbid);

    const getResult = (target, guess) => {
        if (guess < target) return "tooLow";
        if (guess > target) return "tooHigh";
        return "correct";
    };

    const getCloseness = (target, guess, threshold) => {
        target = parseInt(target);
        guess = parseInt(guess);
        if (target === guess) return "correct";
        if (Math.abs(target - guess) > threshold) return "far";
        return "close"
    };
    
    const trackCount = guessLastFmInfo.album.tracks.track.length ?? 1;
    const rank = validGuesses.find(g => (g.artist == artist && g.album == album)).rank;

    const guessMusicBrainzInfo = await MusicBrainz.getAlbumInfo(mbid);
    const year = guessMusicBrainzInfo.date.split('-')[0];

    const guess = {
        "guessNumber": guesses.length + 1,
        "isTarget": rank === target.rank,
        "album": guessLastFmInfo.album.name,
        "artist": {
            "value": guessLastFmInfo.album.artist,
            "closeness": await LastFm.getArtistCloseness(target.artist, artist),
        },
        "trackCount": {
            "value": trackCount,
            "result": getResult(target.trackCount, trackCount),
            "closeness": getCloseness(target.trackCount, trackCount, 3),
        },
        "year": {
            "value": year,
            "result": getResult(target.year, year),
            "closeness": getCloseness(target.year, year, 5),
        },
        "rank": {
            "value": rank,
            "result": getResult(rank, target.rank),
            "closeness": getCloseness(target.rank, rank, 5),
        },
        "guessesLeft": maxGuesses - (guesses.length + 1),
    };

    guesses.push(guess);
    game.save();

    console.log(guess);

    res.json(guess);
}

module.exports = {
    gamePage,
    getData,
    guess,
    // hint,
}