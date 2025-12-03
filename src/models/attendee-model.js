import mongoose from "mongoose";

const AttendeeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: [true, "User ID is required"] },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: [true, "Event ID is required"] },
    checkoutId: { type: mongoose.Schema.Types.ObjectId, ref: "Checkout", required: [true, "Checkout ID is required"] },
  },
  { timestamps: true }
);

export default mongoose.model("Attendee", AttendeeSchema);
