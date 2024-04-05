const { model, Schema } = require('mongoose');

module.exports = model('TimeSchema',
    new Schema({
        guild: String,
        user: String,
        lastDaily: Date,
        nextDaily: Date,
        lastWeekly: Date,
        nextWeekly: Date
    })
);