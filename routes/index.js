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

module.exports = router;
