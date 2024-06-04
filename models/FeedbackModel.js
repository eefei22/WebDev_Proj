const mongoose = require('mongoose');
const { Schema } = mongoose;

const fdbSchema = new mongoose.Schema({
    rating: { type: Number, required: true, min: 1, max: 5 }, // Rating between 1 and 5 stars
    message: { type: String }, // Optional message from the user
    anonymous: { type: Boolean, required: true }, // Whether the feedback is anonymous
    user: { type: Schema.Types.ObjectId, ref: 'User' }, // Reference to the User model, optional
    createdAt: { type: Date, default: Date.now } // Timestamp for when the feedback was created
});

module.exports = mongoose.model('FeedbackModel', fdbSchema);