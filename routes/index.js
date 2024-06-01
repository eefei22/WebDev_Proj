const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Ad = require('../models/Ad');
const ChatHist = require('../models/chats');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get('/', (req, res) => {
    res.render('signin');
});

router.get('/form', (req, res) => {
    res.render('form');
});

router.post('/submit', upload.single('file'), async (req, res) => {
    const { subject, title, about_lesson, about_tutor, rate, hours, languages, location, teaching_sample } = req.body;

    try {
        const newAd = new Ad({
            subject,
            title,
            about_lesson,
            about_tutor,
            rate,
            hours,
            languages: Array.isArray(languages) ? languages : [languages],
            location,
            teaching_sample
        });

        await newAd.save();
        res.redirect('/discover_tutor');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.get('/discover_tutor', async (req, res) => {
    try {
        const ads = await Ad.find({});
        res.render('discover_tutor', { ads });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.get('/tutor_ad/:id', async (req, res) => {
    try {
        const ad = await Ad.findById(req.params.id);
        res.render('tutor_ad', { ad });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Route for Tutor Chat Page
router.get('/tutor_chat/:id', async (req, res) => {
    try {
        // Get chat history from database
        const chatHist = await ChatHist.find({ name: req.params.id });
        res.render('tutor_chat', { chatHist });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

/// Route for Tutor Chat Page
router.get('/tutor_chat/:id', async (req, res) => {
    try {
        // Get chat history from database
        const chatHist = await Chat.find({ name: req.params.id }).populate('username').sort({ timestamp: 1 });
        res.render('tutor_chat', { chatHist, username: 'SomeUsername' }); // Replace 'SomeUsername' with actual username logic
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Route to handle posting chat conversations
router.post('/tutor_chat/:id', async (req, res) => {
    const { message, username } = req.body;
    const name = req.params.id;

    try {
        // Save chat conversation to database
        const newChat = new Chat({
            name: name,
            username,
            message,
            timestamp: new Date()
        });

        await newChat.save();
        res.status(201).send('Chat conversation saved successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Route for rendering feedback form
router.get('/feedback', (req, res) => {
    res.render('feedback'); // Assuming feedback.ejs is in views folder
});

// Route for submitting feedback
router.post('/feedback', async (req, res) => {
    const { rating, comment, anonymous } = req.body;

    try {
        const newFeedback = new FeedbackModel({
            rating,
            comment,
            anonymous
        });

        await newFeedback.save();
        res.redirect('/feedback/thank-you');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Route for thank you page after feedback submission
router.get('/feedback/thank-you', (req, res) => {
    res.render('thank_you'); // Assuming thank_you.ejs is in views folder
});

// Route to render the helpdesk form
router.get('/helpdesk', (req, res) => {
    res.render('helpdesk'); // Assuming helpdesk.ejs is in the views folder
});

// Route to handle form submission
router.post('/helpdesk', async (req, res) => {
    console.log('Received data:', req.body); // Log the incoming data
    const { name, email, message } = req.body;

    // Validate incoming data
    if (!name || !email || !message) {
        console.error('Validation Error: Missing fields');
        return res.status(400).send('All fields are required');
    }

    try {
        const newHelpdesk = new HelpdeskModel({ name, email, message });
        console.log('Data to be saved:', newHelpdesk); // Log the data to be saved
        await newHelpdesk.save(); // Save the new document
        res.status(201).send('Helpdesk request submitted successfully');
    } catch (error) {
        console.error('Error saving to database:', error);
        res.status(500).send('Error submitting helpdesk request');
    }
});


module.exports = router;
