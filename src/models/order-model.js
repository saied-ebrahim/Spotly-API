import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: [true, "User ID is required"] },
    ticketTypeID: { type: mongoose.Schema.Types.ObjectId, ref: "TicketType", required: [true, "Ticket type ID is required"] },
    totalAmount: { type: Number, required: [true, "Total amount is required"] },
    status: { type: String, enum: ["pending", "completed", "cancelled", "failed"], default: "pending", required: [true, "Status is required"] },
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);
