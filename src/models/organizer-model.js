import mongoose from "mongoose";

const OrganizerSchema = new mongoose.Schema(
  {
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: [true, "User ID is required"] },
    eventID: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: [true, "Event ID is required"] },
  },
  { timestamps: true }
);

// Prevent duplicate organizer entries (same user organizing same event)
OrganizerSchema.index({ userID: 1, eventID: 1 }, { unique: true });

export default mongoose.model("Organizer", OrganizerSchema);
