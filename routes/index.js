const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Ad = require('../models/Ad'); 
const User = require('../models/User_signup');
const requireLogin = require('../middleware/requireLogin');
const FeedbackModel = require('../models/FeedbackModel');
const HelpdeskModel = require('../models/HelpdeskModel');
const FaqModel = require('../models/FaqModel');
const Payment = require('../models/payment_model');

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
            user: req.session.userId,
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
        const ad = await Ad.findById(req.params.id).populate('user');
        const user = await User.findById(req.session.userId);
        res.render("tutor_ad", { ad, user });
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

router.get('/payment_report', requireLogin, async (req, res) => {
    try {
        const tutorId = req.session.userId;
        console.log(`Fetching payments for tutorId: ${tutorId}`);

        const payments = await Payment.find({ tutorId: tutorId }).lean();
        console.log(`Payments found: ${JSON.stringify(payments)}`);

        const paymentReport = payments.map(payment => {
            const transactionDate = moment(payment.transactionDate);
            const dueDate = transactionDate.clone().add(1, 'month');  // Clone to avoid mutating the original date

            return {
                cardholderName: payment.cardholderName,
                phone: payment.phone,
                email: payment.email,
                transactionDate: transactionDate.format('D-MM-YYYY'),
                dueDate: dueDate.format('D-MM-YYYY'),
                status: payment.payment_status,
                transactionAmount: `RM${payment.transactionAmount.toFixed(2)}`
            };
        });

        console.log(`Payment Report: ${JSON.stringify(paymentReport)}`);
        res.render('payment_report', { paymentReport });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// router.get('/payment_report', requireLogin, async (req, res) => {
//     try {
//         const payments = await Payment.find({ tutorId: req.session.userId }).lean();

//         const paymentReport = payments.map(payment => {
//             const transactionDate = moment(payment.transactionDate);
//             const dueDate = transactionDate.add(1, 'month');
//             const status = payment.payment_status;

//             return {
//                 name: payment.cardholderName,
//                 phone: payment.phone,
//                 email: payment.email,
//                 paymentDate: transactionDate.format('D-MM-YYYY'),
//                 dueDate: dueDate.format('D-MM-YYYY'),
//                 status,
//                 amount: `RM${payment.transactionAmount.toFixed(2)}`,
//             };
//         });

//         res.render('payment_report', { paymentReport });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Server Error');
//     }
// });

module.exports = router;