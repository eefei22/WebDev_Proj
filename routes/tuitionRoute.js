const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const Payment = require("../models/payment_model");
const bodyParser = require("body-parser");

// Success and Cancel routes
router.get("/success", (req, res) => {
  res.render("success", { title: "Payment Successful" });
});

router.get("/cancel", (req, res) => {
  console.log("Accessing cancel route");
  res.render("cancel", { title: "Cancel" });
});

// Update description route
router.post("/update", async (req, res) => {
  try {
    const { selectedCourses, descriptions } = req.body;

    if (
      !Array.isArray(selectedCourses) ||
      selectedCourses.length === 0 ||
      !Array.isArray(descriptions) ||
      descriptions.length !== selectedCourses.length
    ) {
      return res
        .status(400)
        .json({ error: "Invalid selected courses or descriptions" });
    }

    const updates = selectedCourses.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: {
          $set: {
            description: descriptions[index],
            payment_status: "Paid",
            transactionDate: new Date(),
          },
        },
      },
    }));

    await Payment.bulkWrite(updates);

    res.status(200).json({
      message: "Descriptions and payment statuses updated successfully",
    });
  } catch (error) {
    console.error("Error updating descriptions and payment statuses:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/removePayments", async (req, res) => {
  try {
    const { selectedCourses } = req.body;

    if (!Array.isArray(selectedCourses) || selectedCourses.length === 0) {
      return res.status(400).json({ error: "Invalid selected courses" });
    }

    await Payment.deleteMany({ _id: { $in: selectedCourses } });

    res.status(200).json({ message: "Selected courses removed successfully" });
  } catch (error) {
    console.error("Error removing courses:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Handle Stripe payment process
router.post("/checkout", async (req, res) => {
  try {
    const { userId, selectedCourses, email, descriptions } = req.body;

    if (!Array.isArray(selectedCourses) || selectedCourses.length === 0) {
      return res.status(400).json({ error: "Invalid selected courses" });
    }

    const courses = await Payment.find({
      _id: { $in: selectedCourses },
    }).populate("tutorId");

    const lineItems = courses.map((course) => ({
      price_data: {
        currency: "myr",
        product_data: {
          name: course.tutorId.subject,
          description: course.tutorId.tutorName,
        },
        unit_amount: course.transactionAmount * 100,
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: {
        userId,
        selectedCourses: JSON.stringify(selectedCourses),
        descriptions: JSON.stringify(descriptions),
        route: "tuitionFee",
      },
      phone_number_collection: {
        enabled: true,
      },
      customer_email: email,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
