const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");
const User = require("../models/User_signup");
const requireLogin = require("../middleware/requireLogin");
const Ad = require("../models/Ad");
// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads/"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //change
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("profilePic");

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

// GET /profile/:id - Render the profile page
router.get("/profile/:id", requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.render("profile", { user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// POST /profile/save - Save profile changes
router.post("/profile/save", requireLogin, async (req, res) => {
  try {
    const { id, name, username, phone, gender, dob } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send("User not found");
    }

    user.name = name;
    user.username = username;
    user.phone = phone;
    user.gender = gender;
    user.dob = dob;

    await user.save();
    res.redirect(`/profile/${user._id}?success=Profile updated successfully`);
  } catch (error) {
    console.error(error);
    res.redirect(`/profile/${req.body.id}?error=Server Error`);
  }
});

// Route to handle profile picture upload
router.post("/profile/upload", requireLogin, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error(err);
      if (err.code === "LIMIT_FILE_SIZE") {
        // File size exceeds the limit
        return res.redirect(
          `/profile/${req.body.id}?error=File size exceeds the limit. Please upload a file smaller than 10MB.`
        );
      } else {
        // Other errors
        return res.redirect(
          `/profile/${req.body.id}?error=File upload failed. Please try again.`
        );
      }
    } else {
      if (!req.file) {
        return res.redirect(
          `/profile/${req.body.id}?error=No file selected. Please choose a file to upload.`
        );
      } else {
        try {
          const userId = req.body.id;
          const user = await User.findById(userId);
          if (!user) {
            return res.redirect(`/profile/${userId}?error=User not found`);
          }

          user.profilePic = req.file.filename;
          await user.save();

          // Update the tutorProfilePic in Ad model
          const ads = await Ad.find({ user: userId });
          if (ads) {
            ads.forEach(async (ad) => {
              ad.tutorProfilePic = req.file.filename;
              await ad.save();
            });
          }

          res.redirect(
            `/profile/${user._id}?success=Profile picture uploaded successfully`
          );
        } catch (error) {
          console.error(error);
          res.redirect(`/profile/${req.body.id}?error=Server Error`);
        }
      }
    }
  });
});

// POST /profile/change-password - Change password
router.post("/profile/change-password", requireLogin, async (req, res) => {
  const { id, old_pswd, new_pswd, confirm_pswd } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.redirect(`/profile/${id}?error=User not found`);
    }

    const isMatch = await bcrypt.compare(old_pswd, user.password);
    if (!isMatch) {
      return res.redirect(
        `/profile/${user._id}?error=Password change failed. Current password is incorrect. Please try again`
      );
    }

    if (new_pswd === old_pswd) {
      return res.redirect(
        `/profile/${user._id}?error=Password change failed. The new password you entered matches your current password. Please select a different password.`
      );
    }

    if (new_pswd !== confirm_pswd) {
      return res.redirect(
        `/profile/${user._id}?error=Password change failed. The passwords you entered do not match. Please try again.`
      );
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(new_pswd, salt);

    await user.save();
    res.redirect(`/profile/${user._id}?success=Password updated successfully`);
  } catch (error) {
    console.error(error);
    res.redirect(`/profile/${req.body.id}?error=Server Error`);
  }
});

module.exports = router;
