const mongoose = require('mongoose');

// Game Schema
const GameSchema = new mongoose.Schema({
    host: {
        type: Array,
    },
    name: {
        type: String,
        required: true
    },
    pin: {
        type: String,
        required: true
    },
    guests: {
        type: Array
    }
}, { usePushEach: true });

const Game = mongoose.model('Game', GameSchema);

module.exports = Game;