const express = require("express");
const router = express.Router();
const User = require("../models/User_signup");
const bcrypt = require("bcryptjs");
const PasswordResetToken = require("../models/PasswordResetToken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

// Setup nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  debug: true, // Enable debug output
});

// GET /login - Render the login form
router.get("/login", (req, res) => {
  res.render("signin");
});

// POST /login - Handle user login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    let user = await User.findOne({ email });
    if (!user) {
      return res.send(
        '<script>alert("Login failed. Email not found. Please verify your email address and try again."); window.location.href="/login";</script>'
      );
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.send(
        '<script>alert("Login failed. The password you entered is incorrect. Please try again.");</script>'
      );
    }
    // Store user ID in session
    req.session.userId = user._id;
    console.log("User ID stored in session:", req.session.userId);

    // Send user details to client for session storage
    res.send(`
      <script>
        sessionStorage.setItem("userId", "${user._id}");
        sessionStorage.setItem("email", "${user.email}");
        alert("Welcome back! Your login was successful.");
        window.location.href = "/homepage";
      </script>
    `);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// POST /reset-password-link - Handle password reset link request
router.post("/reset-password-link", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.send(
        '<script>alert("Password reset failed. The email address you entered is not recognized. Please double-check and try again.");</script>'
      );
    }

    // Generate a unique token
    const token = crypto.randomBytes(20).toString("hex");
    const expiresAt = Date.now() + 600000; // 10 minutes

    // Save the token to the PasswordResetToken collection
    const passwordResetToken = new PasswordResetToken({
      userId: user._id,
      token,
      expiresAt,
    });
    await passwordResetToken.save();
    console.log("Password reset token saved:", passwordResetToken);

    // Send the reset link via email
    const resetLink = `${process.env.NGROK_URL}/reset-password/${token}`;
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Action Required: Password Reset",
      text: `We received a request to reset your account password.\n\nClick the link below or enter it in your browser to proceed:\n${resetLink}\n\nIf you did not initiate this request, please ignore this email and your password will remain unchanged.\n\n`,
    };

    await transporter.sendMail(mailOptions);
    res.send(
      '<script>alert("A password reset link has been sent to your email address. Please check your inbox."); window.location.href="/login";</script>'
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// GET /reset-password/:token - Show reset password form
router.get("/reset-password/:token", async (req, res) => {
  try {
    const passwordResetToken = await PasswordResetToken.findOne({
      token: req.params.token,
      expiresAt: { $gt: Date.now() },
    });

    if (!passwordResetToken) {
      return res.redirect(
        "/login?error=The password reset link is invalid or has expired. Please request a new one."
      );
    }

    res.render("reset_password", { token: req.params.token });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// POST /reset-password/:token - Handle new password submission
router.post("/reset-password/:token", async (req, res) => {
  const { password, confirm_password } = req.body;

  if (password !== confirm_password) {
    return res.redirect(
      `/reset-password/${req.params.token}?error=Password reset failed. The passwords you entered do not match. Please try again.`
    );
  }

  try {
    const passwordResetToken = await PasswordResetToken.findOne({
      token: req.params.token,
      expiresAt: { $gt: Date.now() },
    });

    if (!passwordResetToken) {
      return res.redirect(
        "/login?error=The password reset link is invalid or has expired. Please request a new one."
      );
    }

    const user = await User.findById(passwordResetToken.userId);
    if (!user) {
      return res.redirect("/login?error=User not found.");
    }

    // Hash new password and save
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // Remove the token after password has been reset
    await PasswordResetToken.deleteOne({ _id: passwordResetToken._id });

    res.redirect(
      "/login?success=Password updated successfully! You can now proceed to log in with your new credentials."
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
