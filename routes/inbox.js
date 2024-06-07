// /routes/inbox.js
const express = require('express');
const router = express.Router();
const requireLogin = require('../middleware/requireLogin');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User_signup'); // Ensure this path is correct

router.get('/inbox', requireLogin, async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId);

        const conversations = await ChatMessage.find({
            participants: userId
        }).populate('participants', 'name');

        res.render('inbox', { user, conversations });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
