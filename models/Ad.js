const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User_signup', required: false},
    subject: { type: String, required: true },
    title: { type: String, required: true },
    about_lesson: { type: String, required: true },
    about_tutor: { type: String, required: true },
    rate: { type: Number, required: true },
    hours: { type: Number, required: true },
    languages: { type: [String], required: true },
    location: { type: String, required: true },
    mode: { type: String, required: true },
    teaching_sample: { type: String, required: true }
});

module.exports = mongoose.model('Ad', adSchema);
