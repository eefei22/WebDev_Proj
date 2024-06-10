const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const requireLogin = require("../middleware/requireLogin");

// Routes for rendering form and cancel pages
router.get("/form", (req, res) => {
  res.render("form", { title: "Payment Successful" });
});

router.get("/cancel", (req, res) => {
  res.render("cancel", { title: "Cancel" });
});

// Route for creating a subscription session
router.post("/subscription-session", requireLogin, async (req, res) => {
  try {
    const { userId, email } = req.body; // Ensure userId is passed in the request body
    if ((!userId, !email)) {
      return res.status(400).send("UserId and Email are required");
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/form`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "myr",
            product_data: {
              name: "Tutor Lifetime Subscription",
              images: [
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEilK8gbX3rCrpnZ6aS8IHsC4Pqtaeuy26hWvbxIIiJiFixrmU7Mqf2vad3lQ_1IOmxN0SXuoUdmylcvyDFuKnLJCQVjneAtlzLRF1ANLFZdUdWTXmC6mGXeAaT0nNDytiAxQNmrlwWRWrw4k5RzoNLFBXzOVtJu7y5y5A0nVu_g4E4I4Gh2hPxV-qq9C3k/s1080/eduPro_logo.jpg",
              ],
            },
            unit_amount: 15000, // amount in cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        route: "subscribe",
      },
    });

    console.log("Session id:", session.id);
    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
