const mongoose = require('mongoose');
const { Schema } = mongoose;
const User = require('./User_signup'); // Adjust the path as per your project structure

const fdbSchema = new mongoose.Schema({
    rating: { type: Number, required: true, min: 1, max: 5 }, // Rating between 1 and 5 stars
    message: { type: String }, // Optional message from the user
    anonymous: { type: Boolean, required: true }, // Whether the feedback is anonymous
    user: { type: Schema.Types.ObjectId, ref: 'User_signup' }, // Reference to the User model, optional
    name: { type: String }, // Name of the user providing feedback
    ad: { type: Schema.Types.ObjectId, ref: 'Ad' },
    createdAt: { type: Date, default: Date.now } // Timestamp for when the feedback was created
});

module.exports = mongoose.model('FeedbackModel', fdbSchema);
