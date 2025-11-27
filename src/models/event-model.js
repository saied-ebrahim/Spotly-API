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
      latitude: { type: Number, required: [true, "Event latitude is required"] },
      longitude: { type: Number, required: [true, "Event longitude is required"] },
    },
    media: [{ mediaType: { type: String, enum: ["image", "video"], required: [true, "Event media type is required"] }, mediaUrl: { type: String, required: [true, "Event media URL is required"] } }],
    analytics: {
      ticketsSold: { type: Number, default: 0 },
      ticketsAvailable: { type: Number, default: 0, required: [true, "Event tickets available is required"] },
      totalRevenue: { type: Number, default: 0 },
      waitingListCount: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      dislikes: { type: Number, default: 0 },
    },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag", required: [true, "At least one tag is required"] }],
    category: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category", required: [true, "At least one category is required"] }],
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "Organizer", required: [true, "Event organizer is required"] },
  },
  { timestamps: true }
);

export default mongoose.model("Event", EventSchema);
