const { model, Schema } = require('mongoose');

module.exports = model('ModSchema',
    new Schema({
        guild: String,
        user: String,
        staff: String,
        reason: String
    })
);