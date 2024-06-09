const PaymentDetails = require("../models/payment_model.js");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const handleWebhookEvent = async (event, res) => {
  const session = event.data.object;
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
  const metadata = session.metadata;
  const items = JSON.parse(metadata.items);

  const paymentDetailsArray = lineItems.data.map((item) => {
    const itemDetails = items.find((i) => i.subject === item.description);
    return new PaymentDetails({
      userId: metadata.userId,
      tutorId: metadata.tutorId,
      cardholderName: session.customer_details.name,
      phone: session.customer_details.phone,
      transactionDate: new Date(),
      transactionAmount: item.price.unit_amount / 100,
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
    res.status(500).json({ error: "Internal Server Error" });
  }

  res.status(200).json({ received: true });
};

module.exports = { handleWebhookEvent };
