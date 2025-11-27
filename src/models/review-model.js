import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: [true, "User ID is required"] },
    eventID: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: [true, "Event ID is required"] },
    rating: { type: Number, enum: [1, 2, 3, 4, 5] },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      minLength: [10, "Review comment must be at least 10 characters long"],
      maxLength: [100, "Review comment must be at most 100 characters long"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Review", ReviewSchema);
