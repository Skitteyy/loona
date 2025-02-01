const { model, Schema } = require('mongoose');

module.exports = model('GuildSchema',
    new Schema({
        guild: String,
        prefix: String,
        logChannel: String,
        leveling: { type: String, default: 'disabled' }
    })
);