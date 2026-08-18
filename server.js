require("dotenv").config();

const connectDB = require("./src/data/database");
const app = require("./src/app");

const PORT = process.env.PORT || 6000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();