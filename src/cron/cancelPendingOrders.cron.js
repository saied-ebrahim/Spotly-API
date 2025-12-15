import cron from "node-cron";
import orderModel from "../models/order-model.js";
  import userModel from "../models/user-model.js";
  import { sendEmail } from "../utils/emailSender.js";

cron.schedule("*/1 * * * *", async () => {
  try {
    await orderModel.updateMany({ paymentStatus: "cancelled", createdAt: { $lt: new Date(Date.now() - 1 * 60 * 1000) } }, { paymentStatus: "canceled" });
  } catch (err) {
    console.error("Error canceling pending orders:", err.message);
  }
});



cron.schedule("*/1 * * * *", async () => {
  try {
    const users = await userModel.find();
    users.forEach(async (user) => {
      await sendEmail(
        user.email,
        "New Spotly updates are live",
        `
        Hi ${user.firstName} ${user.lastName},

        We’ve just shipped fresh updates on Spotly—here’s what’s new:

        - Discover the latest events curated for you
        - Faster browsing and smoother checkout
        - Personalized picks based on your interests

        <div style="margin: 20px 0;">
          <a
            href="${process.env.FRONTEND_URL}"
            style="
              background-color: #6c5ce7;
              color: #ffffff;
              padding: 12px 18px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 600;
              display: inline-block;
            "
          >
            See the updates
          </a>
        </div>

        Have feedback or spot an issue? Just reply and we’ll help.

        Thanks for being with us,
        The Spotly Team
        `
      );
    });
  } catch (err) {
    console.error("Error sending email:", err.message);
  }
});

