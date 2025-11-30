import mongoose from "mongoose";

const TagSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Tag name is required"], unique: true },
  },
  { timestamps: true }
);

export default mongoose.model("Tag", TagSchema);