import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Category name is required"], unique: true },
    description: { type: String, required: [true, "Category description is required"] },
    image: { type: String, required: [true, "Category image is required"] },
  },
  { timestamps: true }
);

// Virtual populate for events
CategorySchema.virtual("events", {
  ref: "Event",
  localField: "_id",
  foreignField: "category",
});

// Enable virtual fields in JSON output
CategorySchema.set("toJSON", { virtuals: true });
CategorySchema.set("toObject", { virtuals: true });

export default mongoose.model("Category", CategorySchema);
