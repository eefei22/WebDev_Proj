// routes/chat.js
const express = require('express');
const router = express.Router();
const requireLogin = require('../middleware/requireLogin');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User_signup');

router.get('/chat/:tutorId', requireLogin, async (req, res) => {
  const { tutorId } = req.params;
  const userId = req.session.userId;

  try {
    const tutor = await User.findById(tutorId);
    if (!tutor) {
      return res.status(404).send('Tutor not found');
    }

    const messages = await ChatMessage.find({ participants: { $all: [userId, tutorId] } }).sort({ dateTime: 1 });

    res.render('chat_room', {
      user: req.session.user,
      tutor: tutor,
      messages: messages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/chat/message', requireLogin, async (req, res) => {
  const { tutorId, message } = req.body;
  const userId = req.session.userId;

  if (!message || message.trim() === '') {
    return res.status(400).send('Message content is required');
  }

  const newMessage = new ChatMessage({
    participants: [userId, tutorId],
    sender: userId,
    message: message,
  });

  try {
    await newMessage.save();
    res.redirect(`/chat/${tutorId}`);
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;