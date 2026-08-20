const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      unique: true,
      trim: true,
      maxlength: [50, "Name must be at most 50 characters"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);