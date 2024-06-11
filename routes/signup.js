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
      return res.status(400).json({ message: 'Signup failed. The email address is already registered. Please use a different email or log in.' });
    }

    // Check if passwords match
    if (password !== confirm_password) {
      return res.status(400).json({ message: 'Signup failed. The passwords you entered do not match. Please try again.' });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    user = new User({
      name,
      email,
      password: hashedPassword, // Use hashed password
      userType
    });

    await user.save();
    return res.status(200).json({ message: 'Signup successful! You can now log in to your account.' });
  } catch (error) {
    console.error('Error: ', error); // Log detailed error message
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
