const Payment = require("../models/payment_model");

const handleWebhookEvent = async (event, res) => {
  const session = event.data.object;
  const metadata = session.metadata;
  const selectedCourses = JSON.parse(metadata.selectedCourses);
  const descriptions = JSON.parse(metadata.descriptions);
  const phone = session.customer_details.phone;
  const cardholderName = session.customer_details.name;

  try {
    const updates = selectedCourses.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: {
          $set: {
            description: descriptions[index],
            payment_status: "Paid",
            transactionDate: new Date(),
            phone,
            cardholderName,
          },
        },
      },
    }));

    await Payment.bulkWrite(updates);

    console.log("Payment details updated successfully");

    res.sendStatus(200);
  } catch (err) {
    console.error("Error updating payment details:", err.message);
    res.sendStatus(500);
  }
};

module.exports = { handleWebhookEvent };
