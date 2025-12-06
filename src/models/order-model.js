import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: [true, "User ID is required"] },
    eventID: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: [true, "Event ID is required"] },
    ticketTypeID: { type: String, required: [true, "Ticket type ID is required"] },
    // status: { type: String, enum: ["pending", "completed", "cancelled", "failed"], default: "pending", required: [true, "Status is required"] },
    quantity: { type: Number, required: [true, "Quantity is required"] },
    discount: { type: Number, required: [true, "Discount is required"] },
    totalAfterDiscount: { type: Number, required: [true, "Total after discount is required"] },
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);
