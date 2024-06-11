const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Ad = require("../models/Ad");
const User = require("../models/User_signup");
const requireLogin = require("../middleware/requireLogin");
const FeedbackModel = require("../models/FeedbackModel");
const HelpdeskModel = require("../models/HelpdeskModel");
const FaqModel = require("../models/FaqModel");
const Payment = require("../models/payment_model");
const Testimonial = require("../models/testimonial");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

//Route for default page
router.get("/", async (req, res) => {
  try {
    const testimonial = await Testimonial.find({});
    res.render("index_bfr_login", { testimonial });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// Route for homepage
router.get("/homepage", requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    const testimonial = await Testimonial.find({});
    res.render("index", { user, testimonial }); 
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// Route to render form
router.get("/form", requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Check if the user is a tutor
    if (user.userType !== "tutor") {
      return res.render("subscription_tutee", { user });
    }

    // Check if the ad already exists for this teacher
    const ad = await Ad.findOne({ user: req.session.userId });
    if (ad) {
      return res.redirect(`/subscription/${req.session.userId}`);
    }

    res.render("form", { user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// Route to handle form submission
router.post(
  "/submit",
  requireLogin,
  upload.single("file"),
  async (req, res) => {
    const {
      subject,
      title,
      about_lesson,
      about_tutor,
      rate,
      hours,
      languages,
      location,
      mode,
      teaching_sample,
    } = req.body;
    console.log("Form Data:", req.body); // Log form data for debugging
    console.log("File Data:", req.file); // Log file data for debugging

    try {
      // Fetch the user's name from the User_signup model
      const user = await User.findById(req.session.userId);
      if (!user) {
        return res.status(404).send("User not found");
      }

      const newAd = new Ad({
        user: req.session.userId,
        tutorName: user.name, // Set the tutorName field
        subject,
        title,
        about_lesson,
        about_tutor,
        rate,
        hours,
        languages: Array.isArray(languages) ? languages : [languages],
        location,
        mode,
        teaching_sample,
      });

      await newAd.save();
      res.redirect(`/subscription/${newAd.user}`);
    } catch (error) {
      console.error("Error while saving new ad:", error); // Detailed error logging
      res.status(500).send("Server Error");
    }
  }
);

// Route to get the subscription page
router.get("/subscription/:userId", requireLogin, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (user.userType !== "tutor") {
      return res.render("subscription_tutee", { user });
    }

    const ad = await Ad.findOne({ user: userId }).populate("user");
    if (!ad) {
      return res.redirect("/form");
    }

    // Fetch the number of students who have been assigned to this tutor
    const numOfStudents = await Payment.countDocuments({ tutorId: ad._id });

    res.render("subscription", { ad, user, numOfStudents });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    res.status(500).send("Server Error");
  }
});

router.get("/discover_tutor", requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const ads = await Ad.find({}).populate("user");
    res.render("discover_tutor", { ads, user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.get("/tutor_ad/:id", requireLogin, async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id).populate("user");
    const user = await User.findById(req.session.userId);
    res.render("tutor_ad", { ad, user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// Route to get the edit form
router.get("/subscription/edit/:id", requireLogin, async (req, res) => {
  try {
    const adId = req.params.id;
    const ad = await Ad.findById(adId);

    if (!ad) {
      return res.status(404).send("Ad not found");
    }

    // Fetch user data using the session userId
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    res.render("edit", { ad, user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// Route to handle the edit form submission
router.post(
  "/subscription/edit/:id",
  requireLogin,
  upload.single("file"),
  async (req, res) => {
    try {
      const adId = req.params.id;
      const {
        subject,
        title,
        about_lesson,
        about_tutor,
        rate,
        hours,
        languages,
        location,
        mode,
        teaching_sample,
      } = req.body;

      const updatedAd = {
        subject,
        title,
        about_lesson,
        about_tutor,
        rate,
        hours,
        languages: Array.isArray(languages) ? languages : [languages],
        location,
        mode,
        teaching_sample,
      };

      const ad = await Ad.findByIdAndUpdate(adId, updatedAd, { new: true });

      if (!ad) {
        return res.status(404).send("Ad not found");
      }

      res.redirect(`/subscription/${req.session.userId}`);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  }
);

// Route to delete advertisement
router.post("/subscription/delete/:adId", async (req, res) => {
  try {
    const adId = req.params.adId;
    // Delete the advertisement from the database
    await Ad.findByIdAndDelete(adId);
    res.redirect("/form"); // Redirect to the form page
  } catch (error) {
    console.error("Error deleting advertisement:", error);
    res.status(500).send("Server Error");
  }
});

router.get("/feedback", async (req, res) => {
  try {
    const feedbacks = await FeedbackModel.find({});
    res.render("feedback", { feedbacks });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.post("/feedback", async (req, res) => {
  try {
    const { rating, message, anonymous } = req.body;

    const isAnonymous = anonymous === "on";

    const newFeedback = new FeedbackModel({
      rating,
      message,
      anonymous: isAnonymous,
    });

    await newFeedback.save();

    res.redirect("/feedback");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.get("/helpdesk", requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const faqs = await FaqModel.find({});
    res.render("helpdesk", { faqList: faqs, user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// Route to handle form submission and save helpdesk data to the database
router.post("/helpdesk", upload.single("file"), async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Create a new helpdesk entry
    const newHelpdeskEntry = new HelpdeskModel({
      name,
      email,
      message,
    });

    // Save the helpdesk entry to the database
    await newHelpdeskEntry.save();

    // Redirect the user back to the helpdesk page after submitting the form
    res.redirect("/helpdesk");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

const Fuse = require("fuse.js");

router.get("/helpdesk/search", async (req, res) => {
  const query = req.query.query; // Get the search query from the request
  try {
    const faqs = await FaqModel.find({}); // Retrieve all FAQs from the database
    const fuse = new Fuse(faqs, {
      keys: ["question", "answer"],
      threshold: 0.3, // Adjust threshold as needed
      ignoreLocation: true,
      includeScore: true,
    });
    const result = fuse.search(query);
    const faqList = result.map((entry) => entry.item);
    res.render("helpdesk", { faqList });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// Route to fetch payment report
router.get("/payment_report", requireLogin, async (req, res) => {
  try {
    // Fetch only the required fields from the payment_model
    const payments = await Payment.find(
      { tutorId: req.user._id }, // Filter payments by tutorId
      "cardholderName phone email transactionDate payment_status transactionAmount description"
    ).populate("tutorId", "tutorName"); // Populate ad details

    // Map payments to include dueDate
    const paymentReport = payments.map((payment) => {
      const transactionDate = new Date(payment.transactionDate);
      const dueDate = new Date(transactionDate);
      dueDate.setMonth(transactionDate.getMonth() + 1);

      return {
        ...payment._doc,
        dueDate: dueDate.toISOString().split("T")[0], // Convert to YYYY-MM-DD format
      };
    });

    // Render the payment_report EJS template and pass the fetched data
    res.render("payment_report", { paymentReport });
  } catch (error) {
    console.error("Error fetching payment data:", error);
    res.status(500).send("Error fetching payment data");
  }
});


// // Route to fetch payment report
// router.get("/payment_report", requireLogin, async (req, res) => {
//   try {
//     // Fetch only the required fields from the payment_model
//     const payments = await Payment.find(
//       {},
//       "cardholderName phone email transactionDate payment_status transactionAmount description"
//     );

//     // Map payments to include dueDate
//     const paymentReport = payments.map((payment) => {
//       const transactionDate = new Date(payment.transactionDate);
//       const dueDate = new Date(transactionDate);
//       dueDate.setMonth(transactionDate.getMonth() + 1);

//       return {
//         ...payment._doc,
//         dueDate: dueDate.toISOString().split("T")[0], // Convert to YYYY-MM-DD format
//       };
//     });

//     // Render the payment_report EJS template and pass the fetched data
//     res.render("payment_report", { paymentReport });
//   } catch (error) {
//     console.error("Error fetching payment data:", error);
//     res.status(500).send("Error fetching payment data");
//   }
// });


router.get("/tuitionFee", requireLogin, async (req, res) => {
  try {
    const userId = req.session.userId;
    const payments = await Payment.find({ userId }).populate("tutorId");
    res.render("tuitionFee", { payments, userId });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// Route for subscription tutee page
router.get("/subscription_tutee", requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.render("subscription_tutee", { user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
