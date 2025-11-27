import mongoose from "mongoose";

const favouriteSchema = new mongoose.Schema(
  {
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: [true, "User ID is required"] },
    eventID: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: [true, "Event ID is required"] },
  },
  { timestamps: true }
);

export default mongoose.model("Favourite", favouriteSchema);
