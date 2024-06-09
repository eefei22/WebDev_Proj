const User_signup = require("../models/User_signup");

const handleWebhookEvent = async (event, res) => {
  const session = event.data.object;
  const metadata = session.metadata;

  try {
    await User_signup.findByIdAndUpdate(metadata.userId, {
      userType: "teacher",
    });
    console.log(`Updated user ${metadata.userId} to teacher.`);
    res.status(200).json({ received: true });
  } catch (err) {
    console.error(`Failed to update user ${metadata.userId}: ${err.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { handleWebhookEvent };
