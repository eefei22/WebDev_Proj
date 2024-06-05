// routes/chat.js
const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const User = require('../models/User_signup');
const requireLogin = require('../middleware/requireLogin'); // Middleware to check if the user is logged in

router.get('/chat/:tutorId', requireLogin, async (req, res) => {
    try {
        const tutor = await User.findById(req.params.tutorId);
        if (!tutor || tutor.userType !== 'teacher') {
            return res.status(404).send('Tutor not found');
        }

        let chat = await Chat.findOne({ tutorId: req.params.tutorId, studentId: req.session.userId });
        if (!chat) {
            chat = new Chat({
                tutorId: req.params.tutorId,
                studentId: req.session.userId,
                messages: []
            });
            await chat.save();
        }

        res.render('tutor_chat', { chat, tutor });
    } catch (error) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
