const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const AppError = require("../utils/AppError");

async function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new AppError(401, "You are not logged in. Please log in to get access.")
    );
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return next(new AppError(401, "Invalid or expired token. Please log in again."));
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError(401, "The user belonging to this token no longer exists."));
  }

  req.user = user;

  next();
}

module.exports = { protect };