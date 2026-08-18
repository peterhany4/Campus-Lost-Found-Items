const mongoose = require("mongoose");

async function connectDB() {
  await mongoose.connect(process.env.DB_CSTRING);
  console.log("Connected to MongoDB");
}

module.exports = connectDB;