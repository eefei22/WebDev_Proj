const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const PaymentDetails = require("../models/payment_model.js");
const bodyParser = require("body-parser");

router.get("/success", (req, res) => {
  res.render("success", { title: "Payment Successful" });
});

router.get("/cancel", (req, res) => {
  console.log("Accessing cancel route");
  res.render("cancel", { title: "Cancel" });
});

router.post("/check-course-booking", async (req, res) => {
  const { tutorId, userId } = req.body;

  try {
    // Check if the combination of tutorId and userId exists in the database
    const existingBooking = await PaymentDetails.findOne({ tutorId, userId });

    if (existingBooking) {
      return res.json({ alreadyBooked: true });
    } else {
      return res.json({ alreadyBooked: false });
    }
  } catch (error) {
    console.error("Error checking course booking:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { items, userId, email, tutorId } = req.body;
    if (!items || !userId || !email || !tutorId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const lineItems = items.map((item) => {
      if (!item.rate || !item.subject || !item.tutor_name || !item.profilePic) {
        throw new Error("Missing item details");
      }
      return {
        price_data: {
          currency: "myr",
          product_data: {
            name: item.subject,
            description: item.tutor_name,
            // images: [profilePic],
          },
          unit_amount: item.rate * 100, // converting to smallest currency unit
        },
        quantity: 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      customer_email: email,
      line_items: lineItems,
      metadata: {
        userId,
        tutorId,
        items: JSON.stringify(items),
        route: "book",
      },
      phone_number_collection: {
        enabled: true,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
