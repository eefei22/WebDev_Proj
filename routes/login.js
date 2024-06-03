const express = require('express');
const router = express.Router();
const User = require('../models/User_signup');
const bcrypt = require('bcryptjs');

// GET /login - Render the login form
router.get('/login', (req, res) => {
  res.render('signin');
});

// POST /login - Handle user login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Find the user by email
    let user = await User.findOne({ email });
    if (!user) {
      return res.send('<script>alert("Login failed. Email not found. Please verify your email address and try again."); window.location.href="/login";</script>');
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.send('<script>alert("Login failed. The password you entered is incorrect. Please try again."); window.location.href="/login";</script>');
    }
    
    // After successful login, get the user's ID
    
    res.send(`<script>alert("Welcome back! Your login was successful."); window.location.href="/homepage/${user._id}";</script>`);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// POST /reset-password - Handle password reset
router.post('/reset-password', async (req, res) => {
  const { email, new_password, confirm_password } = req.body;

  try {
    // Find the user by email
    let user = await User.findOne({ email });
    if (!user) {
      return res.send('<script>alert("Password reset failed. The email address you entered is not recognized. Please double-check and try again."); window.location.href="/login";</script>');
    }

    // Check if new password matches user's current password
    const isMatch = await bcrypt.compare(new_password, user.password);
    if (isMatch) {
    return res.send('<script>alert("Password reset failed. The new password you entered matches your current password. Please select a different password."); window.location.href="/login";</script>');
    }

    // Check if new password matches confirm password
    if (new_password !== confirm_password) {
      return res.send('<script>alert("Password reset failed. The passwords you entered do not match. Please try again."); window.location.href="/login";</script>');
    }

    // Hash the new password before saving
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(new_password, salt);

    await user.save();
    res.send('<script>alert("Password updated successfully! You can now proceed to log in with your new credentials."); window.location.href="/login";</script>');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
