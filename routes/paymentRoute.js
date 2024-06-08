const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const PaymentDetails = require("../models/Payment.js");
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
      line_items: lineItems,
      metadata: {
        userId,
        email,
        tutorId,
        items: JSON.stringify(items),
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

// Ensure you use the raw body parser for Stripe webhooks
router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const rawBody = req.rawBody;

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log(`Webhook received: ${event.type}`);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id
        );

        const metadata = session.metadata;

        const paymentDetailsArray = lineItems.data.map((item) => {
          const itemDetails = JSON.parse(metadata.items).find(
            (i) => i.subject === item.description
          );
          return new PaymentDetails({
            userId: metadata.userId,
            tutorId: metadata.tutorId,
            cardholderName: session.customer_details.name,
            phone: session.customer_details.phone,
            transactionDate: new Date(),
            transactionAmount: session.amount_total / 100, // converting back to major currency unit
            booking_status: "Booked",
            payment_status: "Paid",
            description: item.description || "",
            email: metadata.email,
            quantity: item.quantity,
            profilePic: itemDetails.profilePic,
          });
        });

        try {
          const savedPaymentDetails = await PaymentDetails.insertMany(
            paymentDetailsArray
          );
          console.log("Payment details saved:", savedPaymentDetails);
        } catch (error) {
          console.error("Error saving payment details:", error);
          throw error; // Rethrow the error to return a 500 response
        }
      }

      res.status(200).json({ received: true });
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

module.exports = router;
