const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    star_rating: { type: Number, min:1, max:5, required: true},
    comment: { type: String},
    anonymous: {
        type: String,
        enum: ['yes', 'no'],
        required: true
    }
});

module.exports = mongoose.model('FeedbackModel', feedbackSchema);