const { model, Schema } = require('mongoose');

module.exports = model('EconomySchema',
    new Schema({
        guild: String,
        user: String,
        balance: { type: Number, default: 1000 },
        job: { type: String, default: 'unemployed' },
        items: Array
    })
);