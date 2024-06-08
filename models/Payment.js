const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User_signup",
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  cardholderName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ad",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  transactionDate: {
    type: Date,
    default: Date.now,
  },
  transactionAmount: {
    type: Number,
    required: true,
  },
  booking_status: {
    type: String,
    required: true,
    enum: ["Unbooked", "Booked"],
    default: "Unbooked",
  },

  payment_status: {
    type: String,
    required: true,
    enum: ["Unpaid", "Paid"],
  },
  description: {
    type: String,
  },

  profilePic: {
    type: String, // URL of the profile picture
    required: true,
  },
});

module.exports = mongoose.model("Payment", paymentSchema);