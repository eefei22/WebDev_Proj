const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const PaymentDetails = require("../models/payment_model.js");
const bodyParser = require("body-parser");
const requireLogin = require("../middleware/requireLogin.js");

router.get("/success", requireLogin, (req, res) => {
  res.render("success", { title: "Payment Successful" });
});

router.get("/cancel", requireLogin, (req, res) => {
  console.log("Accessing cancel route");
  res.render("cancel", { title: "Cancel" });
});

router.post("/cart-checkout-session", async (req, res) => {
  try {
    const { items, userId, email } = req.body;
    if (!items || !userId || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const lineItems = items.map((item) => {
      if (
        !item.rate ||
        !item.subject ||
        !item.tutor_name ||
        !item.profilePic ||
        item.tutorId === undefined
      ) {
        throw new Error("Missing item details");
      }
      return {
        price_data: {
          currency: "myr",
          product_data: {
            name: item.subject,
            description: item.tutor_name,
          },
          unit_amount: item.rate * 100, // converting to smallest currency unit
        },
        quantity: 1,
      };
    });

    // Prepare metadata
    const metadata = {
      userId,
      items: JSON.stringify(items), // Store all items as a JSON string
      route: "cart",
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      customer_email: email,
      line_items: lineItems,
      metadata: metadata,
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

// Route to check if a user has already booked a session with a tutor
router.post("/check-booking", async (req, res) => {
  try {
    const { userId, tutorId } = req.body;

    if (!userId || !tutorId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingBooking = await PaymentDetails.findOne({
      userId: userId,
      tutorId: tutorId,
    });

    if (existingBooking) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking booking:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
