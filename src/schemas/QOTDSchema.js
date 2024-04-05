const { model, Schema } = require('mongoose');

module.exports = model('QOTDSchema',
    new Schema({
        guild: String,
        lastQOTD: Date,
        nextQOTD: Date
    })
);