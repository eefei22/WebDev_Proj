const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User_signup', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User_signup', required: true },
    messages: [
        {
            senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User_signup', required: true },
            text: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model('Chat', chatSchema);
