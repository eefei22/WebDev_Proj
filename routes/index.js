const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Ad = require('../models/Ad');

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
        const chatHist = await ChatHist.find({ tutorId: req.params.id }); // Assuming tutorId is stored in chat history
        res.render('tutor_chat', { chatHist });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Route to handle posting chat conversations
router.post('/tutor_chat/:id', async (req, res) => {
    const { message, userId } = req.body;
    const tutorId = req.params.id; // Assuming tutorId is stored in chat history

    try {
        // Save chat conversation to database
        const newChat = new ChatHist({
            tutorId,
            userId,
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

module.exports = router;
