const mongoose = require('mongoose');
// const _ = require('underscore');

// const setName = (name) => _.escape(name).trim();

const TargetSchema = new mongoose.Schema({
  album: {
    type: String,
    required: true,
    trim: true,
    // set: setName,
  },
  artist: {
    type: String,
    required: true,
    trim: true,
    // set: setName,
  },
  year: {
    type: Number,
    required: true,
    min: 1,
  },
  trackCount: {
    type: Number,
    required: true,
    min: 1,
  },
  rank: {
    type: Number,
    required: true,
    min: 1,
  },
  mbid: {
    type: String,
    required: true,
  },
});

const AlbumSchema = new mongoose.Schema({
  artist: {
    type: String,
    required: true,
    trim: true,
    // set: setName,
  },
  album: {
    type: String,
    required: true,
    trim: true,
    // set: setName,
  },
  rank: {
    type: Number,
    required: true,
  },
  mbid: {
    type: String,
  },
});

const ArtistResultSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    trim: true,
    // set: setName,
  },
  closeness: {
    type: String,
    enum: ['correct', 'close', 'far'],
    required: true,
  },
});

const ResultSchema = new mongoose.Schema({
  value: {
    type: Number,
    required: true,
    min: 1,
  },
  result: {
    type: String,
    enum: ['tooLow', 'correct', 'tooHigh'],
    required: true,
  },
  closeness: {
    type: String,
    enum: ['correct', 'close', 'far'],
    required: true,
  },
});

const GuessSchema = new mongoose.Schema({
  guessNumber: {
    type: Number,
    required: true,
    min: 1,
  },
  isTarget: {
    type: Boolean,
    required: true,
  },
  album: {
    type: String,
    required: true,
    trim: true,
    // set: setName,
  },
  artist: {
    type: ArtistResultSchema,
    required: true,
  },
  year: {
    type: ResultSchema,
    required: true,
  },
  trackCount: {
    type: ResultSchema,
    required: true,
  },
  rank: {
    type: ResultSchema,
    required: true,
  },
});

const HintSchema = new mongoose.Schema({
  hintNumber: {
    type: Number,
    required: true,
    min: 1,
  },
  attribute: {
    type: String,
    enum: ['year', 'trackCount', 'rank'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: 1,
  },
});

const ActionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['guess', 'hint'],
    required: true,
  },
  number: {
    type: Number,
    required: true,
    min: 1,
  },
});

const ActionContainerSchema = new mongoose.Schema({
  actionNumber: {
    type: Number,
    required: true,
    min: 1,
  },
  action: {
    type: ActionSchema,
    required: true,
  },
});

const GameSchema = new mongoose.Schema({
  target: {
    type: TargetSchema,
    required: true,
  },
  validGuesses: {
    type: [AlbumSchema],
    required: true,
  },
  maxGuesses: {
    type: Number,
    required: true,
    min: 1,
  },
  guesses: {
    type: [GuessSchema],
    default: [],
  },
  hints: {
    type: [HintSchema],
    default: [],
  },
  actions: {
    type: [ActionContainerSchema],
    default: [],
  },
  guessesLeft: {
    type: Number,
    required: true,
  },
  hintsLeft: {
    type: Number,
    required: true,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

const removeRanks = (guess) => ({
  album: guess.album,
  artist: guess.artist,
  mbid: guess.mbid,
});

const sortAlbums = (a, b) => {
  const trimString = (str) => {
    let newStr = str.toLowerCase();
    if (newStr.startsWith('the ')) [, newStr] = newStr.split(/^the /);
    return newStr;
  };

  const artistOneTrim = trimString(a.artist);
  const artistTwoTrim = trimString(b.artist);
  const albumOneTrim = trimString(a.album);
  const albumTwoTrim = trimString(b.album);

  return artistOneTrim.localeCompare(artistTwoTrim) || albumOneTrim.localeCompare(albumTwoTrim);
};

GameSchema.statics.toAPI = (doc) => ({
  validGuesses: doc.validGuesses.map(removeRanks).sort(sortAlbums),
  maxGuesses: doc.maxGuesses,
  guesses: doc.guesses.sort((a, b) => a.guessNumber - b.guessNumber),
  hints: doc.hints.sort((a, b) => a.hintNumber - b.hintNumber),
  actions: doc.actions.sort((a, b) => a.actionNumber - b.actionNumber),
  guessesLeft: doc.guessesLeft,
  hintsLeft: doc.hintsLeft,
});

const BreakdownCategorySchema = new mongoose.Schema({
  guesses: {
    type: Number,
    required: true,
  },
  frequency: {
    type: Number,
    required: true,
    default: 0,
  },
});

const AllTimeStatsSchema = new mongoose.Schema({
  wins: {
    type: Number,
    required: true,
    default: 0,
  },
  losses: {
    type: Number,
    required: true,
    default: 0,
  },
  breakdown: {
    type: [BreakdownCategorySchema],
    required: true,
  },
});

const CompletedGameSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  target: {
    type: TargetSchema,
    required: true,
  },
  outcome: {
    type: String,
    enum: ['won', 'lost'],
    required: true,
  },
  guesses: {
    type: [GuessSchema],
    required: true,
    default: [],
  },
  hints: {
    type: [HintSchema],
    required: true,
    default: [],
  },
  actions: {
    type: [ActionContainerSchema],
    required: true,
    default: [],
  },
});

const StatsSchema = new mongoose.Schema({
  allTime: {
    type: AllTimeStatsSchema,
    required: true,
  },
  completedGames: {
    type: [CompletedGameSchema],
    required: true,
    default: [],
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
});

StatsSchema.statics.toAPI = (doc) => ({
  allTime: doc.allTime,
  completedGames: doc.completedGames,
});

const GameModel = mongoose.model('Game', GameSchema);
const StatsModel = mongoose.model('Stats', StatsSchema);

module.exports.Game = GameModel;
module.exports.Stats = StatsModel;
