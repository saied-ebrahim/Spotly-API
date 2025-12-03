import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Event title is required"] },
    description: { type: String, required: [true, "Event description is required"] },
    date: { type: Date, required: [true, "Event date is required"] },
    time: { type: String, required: [true, "Event time is required"] },
    location: {
      country: { type: String, required: [true, "Event country is required"] },
      city: { type: String, required: [true, "Event city is required"] },
      address: { type: String, required: [true, "Event address is required"] },
      latitude: { type: Number, nullable: true, default: null },
      longitude: { type: Number, nullable: true, default: null },
    },
    media: [{ mediaType: { type: String, enum: ["image", "video"], required: [true, "Event media type is required"] }, mediaUrl: { type: String, required: [true, "Event media URL is required"] } }],
    analytics: {
      ticketsSold: { type: Number, default: 0 },
      ticketsAvailable: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      waitingListCount: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      dislikes: { type: Number, default: 0 },
    },
    ticketType: {
      ticketID: { type: String },
      title: { type: String },
      price: { type: Number, required: [true, "Ticket type price is required"] },
      quantity: { type: Number, required: [true, "Ticket type quantity is required"] },
      image: { type: String },
      discount: { type: Number },
    },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag", required: [true, "At least one tag is required"] }],
    category: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category", required: [true, "At least one category is required"] }],
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "Organizer", required: [true, "Event organizer is required"] },
  },
  { timestamps: true }
);

// ! Generate ticket ID
EventSchema.pre("save", function (next) {
  if (!this.ticketType.ticketID) {
    this.ticketType.ticketID = "TICKET-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  }
  next();
});

export default mongoose.model("Event", EventSchema);
