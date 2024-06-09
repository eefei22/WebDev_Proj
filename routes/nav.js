const express = require('express');
const router = express.Router();

// Route for the home page
router.get('/', (req, res) => {
    res.render('discover_tutor'); // Assuming 'form.ejs' is your home page
});

// Route for the subscription page
router.get('/form', (req, res) => {
    res.render('form');
});

// Route for discovering tutors
router.get('/discover_tutor', (req, res) => {
    res.render('discover_tutor');
});

// Route for the tuition fee page
router.get('/tuitionFee', (req, res) => {
    res.render('tuitionFee');
});

// Route for the helpdesk page
router.get('/helpdesk', (req, res) => {
    res.render('helpdesk');
});

// Route for the profile page
router.get('/profile', (req, res) => {
    res.render('profile');
});

module.exports = router;
