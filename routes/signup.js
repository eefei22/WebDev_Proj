const express = require('express');
const router = express.Router();
const User = require('../models/User_signup');
const bcrypt = require('bcryptjs');

// GET /signup - Render the signup form
router.get('/signup', (req, res) => {
  res.render('signup');
});

// POST /signup - Handle user signup
router.post('/signup', async (req, res) => {
  const { name, email, password, confirm_password, userType } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.send('<script>alert("Signup failed. The email address is already registered. Please use a different email or log in."); window.location.href="/signup";</script>');
    }

    // Check if passwords match
    if (password !== confirm_password) {
        return res.send('<script>alert("Signup failed. The passwords you entered do not match. Please try again."); window.location.href="/signup";</script>');
    }

    // Create a new user
    user = new User({
      name,
      email,
      password,
      userType
    });

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    res.send('<script>alert("Signup successful! You can now log in to your account."); window.location.href="/login";</script>'); //redirect user to login page
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
