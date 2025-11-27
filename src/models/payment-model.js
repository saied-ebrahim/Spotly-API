import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderID: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: [true, "Order ID is required"] },
    amount: { type: Number, required: [true, "Amount is required"] },
    provider: { type: String, required: [true, "Provider is required"] },
    currency: { type: String, required: [true, "Currency is required"] },
    paymentMethod: { type: String, required: [true, "Payment method is required"] },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
