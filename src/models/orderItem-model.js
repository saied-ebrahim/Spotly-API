import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    orderID: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: [true, "Order ID is required"] },
    ticketTypeID: { type: mongoose.Schema.Types.ObjectId, ref: "TicketType", required: [true, "Ticket type ID is required"] },
    quantity: { type: Number, required: [true, "Quantity is required"] },
    totalAmount: { type: Number },
    totalDiscount: { type: Number },
    afterDiscount: { type: Number },
    attendeeID: { type: mongoose.Schema.Types.ObjectId, ref: "Attendee", required: [true, "Attendee ID is required"] },
    discountID: { type: mongoose.Schema.Types.ObjectId, ref: "Discount" },
  },
  { timestamps: true }
);

export default mongoose.model("OrderItem", OrderItemSchema);
