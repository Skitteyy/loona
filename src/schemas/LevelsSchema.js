const { model, Schema } = require('mongoose');

module.exports = model('LevelsSchema',
    new Schema({
        guild: String,
        user: String,
        level: { type: Number, default: 0 },
        xp: { type: Number, default: 0 },
        totalXp: { type: Number, default: 0 }
    })
);