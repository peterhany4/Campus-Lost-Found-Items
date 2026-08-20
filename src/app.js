const express = require("express");
const morgan = require("morgan");

const AppError = require("./utils/AppError");
const authRouter = require("./Routers/auth.router");
const userRouter = require("./Routers/user.router");
const itemRouter = require("./Routers/item.router");
const categoryRouter = require("./Routers/category.router");
const adminRouter = require("./Routers/admin.router");

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use((req, res, next) => {
  req.body = req.body || {};
  next();
});
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/items", itemRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/admin", adminRouter);

app.get("/", (req, res) => {
  res.json({ message: "Campus Lost & Found API" });
});

app.use((req, res, next) => {
  next(new AppError(404, `Cannot find ${req.originalUrl} on this server`));
});

app.use((error, req, res, next) => {
  let err = error;

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join("; ");
    err = new AppError(400, message);
  } else if (err.code === 11000) {
    err = new AppError(409, "That email is already registered");
  } else if (
    err.name === "JsonWebTokenError" ||
    err.name === "TokenExpiredError"
  ) {
    err = new AppError(401, "Invalid or expired token. Please log in again.");
  } else if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      err = new AppError(400, "File is too large (max 5MB)");
    } else if (
      err.code === "LIMIT_FILE_COUNT" ||
      err.code === "LIMIT_UNEXPECTED_FILE"
    ) {
      err = new AppError(400, "Too many files (max 5)");
    } else {
      err = new AppError(400, err.message);
    }
  } else if (err.name === "CastError") {
    err = new AppError(404, "Resource not found");
  } else if (err.type === "entity.parse.failed") {
    err = new AppError(400, "Invalid JSON in request body");
  } else if (!err.isOperational) {
    console.error("UNEXPECTED ERROR:", err);
    err = new AppError(500, "Something went wrong");
  }

  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    statusCode: err.statusCode || 500,
    message: err.message,
  });
});

module.exports = app;