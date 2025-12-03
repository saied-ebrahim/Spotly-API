import mongoose from "mongoose";

const checkoutSchema = new mongoose.Schema(
  {
    orderID: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: [true, "Order ID is required"] },
    user: {
      userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: [true, "User ID is required"] },
      name: { type: String, required: [true, "User name is required"] },
      email: { type: String, required: [true, "User email is required"] },
      phone: { type: String, required: [true, "User phone is required"] },
      address: {
        country: { type: String, required: [true, "User country is required"] },
        city: { type: String, required: [true, "User city is required"] },
        line1: { type: String, required: [true, "User line1 is required"] },
        line2: { type: String },
        state: { type: String },
        postalCode: { type: String },
      },
    },
    amount: { type: Number, required: [true, "Amount is required"] },
    currency: { type: String, required: [true, "Currency is required"] },
    provider: { type: String, default: "stripe" },
    paymentMethod: {
      type: String,
      method: { type: String, default: "card" },
      brand: { type: String, default: "visa" },
      last4: { type: String, required: [true, "Last 4 digits of card is required"] },
      expMonth: { type: Number, required: [true, "Expiration month is required"] },
      expYear: { type: Number, required: [true, "Expiration year is required"] },
    },
    status: { type: String, enum: ["pending", "paid", "failed", "refunded", "cancelled"], default: "pending" },
    transactionId: { type: String },
    paidAt: { type: Date },
    metadata: {
      eventId: { type: String, required: [true, "Event ID is required"] },
      ticketTypeId: { type: String, required: [true, "Ticket type ID is required"] },
      quantity: { type: String, required: [true, "Quantity is required"] },
    },
    totalAmount: { type: Number },
    userAgent: String,
    deviceId: String,
  },
  { timestamps: true }
);

const Checkout = mongoose.model("Checkout", checkoutSchema);

export default Checkout;
