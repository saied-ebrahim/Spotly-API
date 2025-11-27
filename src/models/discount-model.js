import mongoose from "mongoose";

const discountSchema = new mongoose.Schema(
  {
    eventID: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: [true, "Event ID is required"] },
    code: { type: String, required: [true, "Discount code is required"] },
    discountValue: { type: Number, required: [true, "Discount value is required"] },
    expiresAt: { type: Date, required: [true, "End date is required"] },
    maxUsage: { type: Number, required: [true, "Max usage is required"] },
    maxUsagePerUser: { type: Number, required: [true, "Max usage per user is required"] },
  },
  { timestamps: true }
);

export default mongoose.model("Discount", discountSchema);
