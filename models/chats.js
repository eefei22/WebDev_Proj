// models/chats.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    name: { type: mongoose.Schema.Types.ObjectId, ref: 'tutor_profile', required: true },
    username: { type: mongoose.Schema.Types.ObjectId, ref: 'tutor_profile', required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', chatSchema);
