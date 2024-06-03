const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('../models/User_signup');

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads/'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));//change
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('profilePic');

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// GET /profile/:id - Render the profile page
router.get('/profile/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('profile', { user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// POST /profile/save - Save profile changes
router.post('/profile/save', async (req, res) => {
    try {
        const { id, name, username, phone, gender, dob } = req.body;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        user.name = name;
        user.username = username;
        user.phone = phone;
        user.gender = gender;
        user.dob = dob;

        await user.save();
        res.send('<script>alert("Profile updated successfully!"); window.location.href="/profile/' + user._id + '";</script>');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Route to handle profile picture upload
router.post('/profile/upload', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error(err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                // File size exceeds the limit
                return res.status(400).send('<script>alert("File size exceeds the limit. Please upload a file smaller than 10MB."); window.history.back();</script>');
            } else {
                // Other errors
                return res.status(400).send('<script>alert("File upload failed. Please try again."); window.history.back();</script>');
            }
            
        } else {
            if (!req.file) {
                return res.status(400).send('<script>alert("No file selected. Please choose a file to upload."); window.history.back();</script>')
            } else {
                try {
                    const userId = req.body.id;
                    const user = await User.findById(userId);
                    if (!user) {
                        return res.status(404).send('User not found');
                    }

                    user.profilePic = req.file.filename;
                    await user.save();

                    res.send(`<script>alert('Profile picture uploaded successfully!'); window.location.href = '/profile/${user._id}';</script>`);
                } catch (error) {
                    console.error(error);
                    res.status(500).send('Server Error');
                }
            }
        }
    });
});

// POST /profile/change-password - Change password
router.post('/profile/change-password', async (req, res) => {
    const { id, old_pswd, new_pswd, confirm_pswd } = req.body;
    
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        const isMatch = await bcrypt.compare(old_pswd, user.password);
        if (!isMatch) {
            return res.send('<script>alert("Password change failed. Current password is incorrect. Please try again"); window.location.href="/profile/' + user._id + '";</script>');
        }

        if (new_pswd === old_pswd) {
            return res.send('<script>alert("Password change failed. The new password you entered matches your current password. Please select a different password."); window.location.href="/profile/' + user._id + '";</script>');
        }

        if (new_pswd !== confirm_pswd) {
            return res.send('<script>alert("Password change failed. The passwords you entered do not match. Please try again."); window.location.href="/profile/' + user._id + '";</script>');
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(new_pswd, salt);

        await user.save();
        res.send('<script>alert("Password updated successfully!"); window.location.href="/profile/' + user._id + '";</script>');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
