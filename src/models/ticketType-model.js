import mongoose from "mongoose";

const TicketTypeSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Ticket type title is required"] },
    eventID: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: [true, "Event ID is required"] },
    price: { type: Number, required: [true, "Ticket type price is required"] },
    quantity: { type: Number, required: [true, "Ticket type quantity is required"] },
    image: { type: String, required: [true, "Ticket type image is required"] },
  },
  { timestamps: true }
);

export default mongoose.model("TicketType", TicketTypeSchema);
