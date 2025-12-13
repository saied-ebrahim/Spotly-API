import cron from "node-cron";
import orderModel from "../models/order-model.js";

cron.schedule("*/1 * * * *", async () => {
  try {
    console.log("Running cancel pending orders job...");

    await orderModel.updateMany(
      {
        paymentStatus: "pending",
        createdAt: { $lt: new Date(Date.now() - 1 * 60 * 1000) },
      },
      { paymentStatus: "canceled" }
    );
  } catch (err) {
    console.error("Cron job error:", err);
  }
});

