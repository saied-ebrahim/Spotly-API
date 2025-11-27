import mongoose from "mongoose";

const SpeakerSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Speaker name is required"] },
    eventID: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: [true, "Event ID is required"] },
    bio: { type: String, maxLength: [255, "Bio must be less than 255 characters"] },
    avatar: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Speaker", SpeakerSchema);
