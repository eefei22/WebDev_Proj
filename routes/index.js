const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Ad = require('../models/Ad'); 
const User = require('../models/User_signup');
const requireLogin = require('../middleware/requireLogin');

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

// Route for homepage
router.get('/homepage', requireLogin, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('index', { user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Route to render form
router.get('/form', requireLogin, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
    res.render('form', {user});
    }catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Route to handle form submission
router.post('/submit', requireLogin, upload.single('file'), async (req, res) => {
    const { subject, title, about_lesson, about_tutor, rate, hours, languages, location, teaching_sample } = req.body;

    try {
        const newAd = new Ad({
            user: req.session.userId, // Associate the ad with the logged-in user
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
        res.redirect(`/discover_tutor`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.get('/subscription/:id', requireLogin, async (req, res) => {
    try {
        const ad = await Ad.findById(req.params.id).populate('user');
        const user = await User.findById(req.session.userId);

        if (!ad) {
            return res.status(404).send('Ad not found');
        }

        res.render('subscription', {user});
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.get('/discover_tutor', requireLogin, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const ads = await Ad.find({}).populate('user');
        res.render('discover_tutor', {ads, user});
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.get("/tutor_ad/:id", requireLogin, async (req, res) => {
    try {
      const ad = await Ad.findById(req.params.id);
      const user = await User.findById(req.session.userId);
      res.render("tutor_ad", {ad, user});
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  });
  

router.get('/edit/:id', requireLogin, async (req, res) => {
    try {
        const ad = await Ad.findById(req.params.id);

        if (!ad) {
            return res.status(404).send('Ad not found');
        }

        res.render('editform', {user});
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.post('/edit/:id', requireLogin, upload.single('file'), async (req, res) => {
    const { subject, title, about_lesson, about_tutor, rate, hours, languages, location, teaching_sample } = req.body;
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

module.exports = router;