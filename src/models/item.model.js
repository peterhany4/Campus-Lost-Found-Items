const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title must be at most 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [1000, "Description must be at most 1000 characters"],
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: ["lost", "found"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "RECOVERED"],
      default: "ACTIVE",
    },
    images: {
      type: [String],
      default: [],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);