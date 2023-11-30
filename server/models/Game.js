const mongoose = require('mongoose');
const _ = require('underscore');

const setName = (name) => _.escape(name).trim();

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
})

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
})

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
        required: true
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

const removeRanks = (guess) => {
    return {
        "album": guess.album,
        "artist": guess.artist,
        "mbid": guess.mbid,
    };
}

const sortAlbums = (a, b) => {
    const trimString = (str) => {
        let newStr = str.toLowerCase();
        if (newStr.startsWith('the ')) newStr = newStr.split(/^the /)[1];
        return newStr;
    }

    let artistOneTrim = trimString(a.artist);
    let artistTwoTrim = trimString(b.artist);
    let albumOneTrim = trimString(a.album);
    let albumTwoTrim = trimString(b.album);

    return artistOneTrim.localeCompare(artistTwoTrim) || albumOneTrim.localeCompare(albumTwoTrim) ;
}

GameSchema.statics.toAPI = (doc) => ({
    "validGuesses": doc.validGuesses.map(removeRanks).sort(sortAlbums),
    "maxGuesses": doc.maxGuesses,
    "guesses": doc.guesses.sort((a, b) => a.guessNumber - b.guessNumber),
    "hints": doc.hints.sort((a, b) => a.hintNumber - b.hintNumber),
    "actions": doc.actions.sort((a, b) => a.actionNumber - b.actionNumber),
});

const GameModel = mongoose.model('Game', GameSchema);
module.exports = GameModel;