const express = require('express');
const router = express.Router();
const multer = require('multer'); //for upload file
const path = require('path');
const Ad = require('../models/Ad'); //the database
const User = require('../models/User_signup');
const FeedbackModel = require('../models/FeedbackModel');
const HelpdeskModel = require('../models/HelpdeskModel');
const FaqModel = require('../models/FaqModel');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

//Route for default page
router.get('/', (req, res) => {
    res.render('index_bfr_login');
});

//Route for homepage
router.get('/homepage/:id', async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('index', { user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.get('/form', (req, res) => {
    res.render('form');
});

router.post('/submit', upload.single('file'), async (req, res) => {
    const { subject, title, about_lesson, about_tutor, rate, hours, languages, location, mode, teaching_sample } = req.body;

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
            mode,
            teaching_sample
        });

        await newAd.save();
        res.redirect(`/subscription/${newAd._id}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.get('/subscription/:id', async (req, res) => {
    try {
        const adId = req.params.id;
        const ad = await Ad.findById(adId);

        if (!ad) {
            return res.status(404).send('Ad not found');
        }

        res.render('subscription', { ad });
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

// Route to handle fetching the ad for editing
router.get('/edit/:id', async (req, res) => {
    try {
        const adId = req.params.id;
        const ad = await Ad.findById(adId);

        if (!ad) {
            return res.status(404).send('Ad not found');
        }

        res.render('editform', { ad });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Route to handle updating the ad
router.post('/edit/:id', upload.single('file'), async (req, res) => {
    const { subject, title, about_lesson, about_tutor, rate, hours, languages, location, mode, teaching_sample } = req.body;
    const adId = req.params.id;

    try {
        const ad = await Ad.findById(adId);

        if (!ad) {
            return res.status(404).send('Ad not found');
        }

        ad.subject = subject;
        ad.title = title;
        ad.about_lesson = about_lesson;
        ad.about_tutor = about_tutor;
        ad.rate = rate;
        ad.hours = hours;
        ad.languages = Array.isArray(languages) ? languages : [languages];
        ad.location = location;
        ad.mode = mode;
        ad.teaching_sample = teaching_sample;

        if (req.file) {
            ad.file = req.file.path;
        }

        await ad.save();
        res.redirect(`/subscription/${ad._id}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.get('/feedback', async (req, res) => {
    try {
        const feedbacks = await FeedbackModel.find({});
        res.render('feedback', { feedbacks });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.post('/feedback', async (req, res) => {
    try {
        const { rating, message, anonymous } = req.body;

        const isAnonymous = anonymous === 'on';

        const newFeedback = new FeedbackModel({
            rating,
            message,
            anonymous: isAnonymous
        });

        await newFeedback.save();

        res.redirect('/feedback');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.get('/helpdesk', async (req, res) => {
    try {
        const faqs = await FaqModel.find({});
        res.render('helpdesk', { faqList: faqs });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


// Route to handle form submission and save helpdesk data to the database
router.post('/helpdesk', upload.single('file'), async (req, res) => {
    const { name, email, message } = req.body;

    try {
        // Create a new helpdesk entry
        const newHelpdeskEntry = new HelpdeskModel({
            name,
            email,
            message
        });

        // Save the helpdesk entry to the database
        await newHelpdeskEntry.save();

        // Redirect the user back to the helpdesk page after submitting the form
        res.redirect('/helpdesk');

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

const Fuse = require('fuse.js');

router.get('/helpdesk/search', async (req, res) => {
    const query = req.query.query;  // Get the search query from the request
    try {
        const faqs = await FaqModel.find({}); // Retrieve all FAQs from the database
        const fuse = new Fuse(faqs, {
            keys: ['question', 'answer'],
            threshold: 0.3, // Adjust threshold as needed
            ignoreLocation: true,
            includeScore: true
        });
        const result = fuse.search(query);
        const faqList = result.map(entry => entry.item);
        res.render('helpdesk', { faqList });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;