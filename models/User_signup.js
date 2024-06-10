const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, required: true, enum: ["student", "tutor"] },
  username: { type: String },
  phone: { type: String },
  gender: { type: String, enum: ["male", "female"] },
  dob: { type: String },
  profilePic: { type: String },
});

module.exports = mongoose.model("User_signup", userSchema);
