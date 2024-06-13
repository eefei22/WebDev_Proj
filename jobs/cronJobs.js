const cron = require("node-cron");
const Payment = require("../models/payment_model");

// Scheduled task to run every minute
function setupCronJobs() {
  cron.schedule("*/1 * * * *", async () => {
    try {
      // Find all payments where the transaction date is more than 1 minute ago
      const overduePayments = await Payment.find({
        transactionDate: {
          $lt: new Date(new Date().getTime() - 1 * 60 * 1000), // 1 minute ago
        },
        payment_status: "Paid", // Only consider previously paid courses
      });

      // Update the payment status of overdue courses to "Unpaid"
      await Promise.all(
        overduePayments.map(async (payment) => {
          payment.payment_status = "Unpaid";
          await payment.save();
        })
      );
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  });
  console.log("Cron jobs are set up to run every minute.");
}

module.exports = setupCronJobs;

// const cron = require("node-cron");
// const Payment = require("../models/payment_model");

// // Scheduled task to run every day at midnight
// function setupCronJobs() {
//   cron.schedule("0 0 * * *", async () => {
//     try {
//       // Find all payments where the transaction date is more than 1 month ago
//       const overduePayments = await Payment.find({
//         transactionDate: {
//           $lt: new Date(new Date().setMonth(new Date().getMonth() - 1)), // 1 month ago
//         },
//         payment_status: "Paid", // Only consider previously paid courses
//       });

//       // Update the payment status of overdue courses to "Unpaid"
//       await Promise.all(
//         overduePayments.map(async (payment) => {
//           payment.payment_status = "Unpaid";
//           await payment.save();
//         })
//       );
//     } catch (error) {
//       console.error("Error updating payment status:", error);
//     }
//   });
//   console.log("Cron jobs are set up to run every day at midnight.");
// }

// module.exports = setupCronJobs;
