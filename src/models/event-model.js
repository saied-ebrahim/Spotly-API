import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Event title is required"] },
    description: { type: String, required: [true, "Event description is required"] },
    date: { type: Date, required: [true, "Event date is required"] },
    time: { type: String, required: [true, "Event time is required"] },
    type: {
      type: String,
      enum: {
        values: ["online", "offline"],
        message: "Event type must be either 'online' or 'offline'",
      },
      default: "offline",
      required: [true, "Event type is required"],
    },
    location: {
      country: { type: String, default: "Egypt" },
      district: {
        type: String,
        validate: {
          validator: function () {
            return this.type === "online" || this.type !== "online";
          },
          message: "Event district is required for offline events",
        },
      },
      city: {
        type: String,
        validate: {
          validator: function () {
            return this.type === "online" || this.type !== "online";
          },
          message: "Event city is required for offline events",
        },
      },
      address: {
        type: String,
        validate: {
          validator: function () {
            return this.type === "online" || this.type !== "online";
          },
          message: "Event address is required for offline events",
        },
      },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    media: { mediaType: { type: String, enum: ["image", "video"], required: [true, "Event media type is required"] }, mediaUrl: { type: String, required: [true, "Event media URL is required"] } },
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
      price: { type: Number, default: 0 },
      quantity: { type: Number, required: [true, "Ticket type quantity is required"] },
      discount: { type: Number },
    },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag", required: [true, "At least one tag is required"] }],
    category: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category", required: [true, "At least one category is required"] }],
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: [true, "Event organizer is required"] },
  },
  { timestamps: true }
);

EventSchema.pre("save", function (next) {
  if (this.type === "offline") this.location.country = "Egypt";
  next();
});

EventSchema.path("analytics.ticketsAvailable").validate({
  validator: function (value) {
    return value >= 0;
  },
  message: "Event tickets available must be a non-negative number",
});

EventSchema.path("analytics.ticketsSold").validate({
  validator: function (value) {
    return value >= 0;
  },
  message: "Event tickets sold must be a non-negative number",
});

EventSchema.path("analytics.likes").validate({
  validator: function (value) {
    return value >= 0;
  },
  message: "Event likes must be a non-negative number",
});

EventSchema.path("analytics.dislikes").validate({
  validator: function (value) {
    return value >= 0;
  },
  message: "Event dislikes must be a non-negative number",
});

EventSchema.path("ticketType.price").validate({
  validator: function (value) {
    return value >= 0;
  },
  message: "Ticket type price must be a non-negative number",
});

export default mongoose.model("Event", EventSchema);
