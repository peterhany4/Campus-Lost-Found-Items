const bcrypt = require("bcryptjs");
const validator = require("validator");

const User = require("../models/user.model");
const AppError = require("../utils/AppError");
const generateToken = require("../utils/generateToken");

async function register(req, res, next) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new AppError(400, "Please provide name, email and password"));
  }

  if (typeof password !== "string" || password.length < 8) {
    return next(new AppError(400, "Password must be at least 8 characters"));
  }

  if (!validator.isEmail(email)) {
    return next(new AppError(400, "Please provide a valid email address"));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError(409, "Email is already registered"));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = generateToken(user._id);

  res.status(201).json({ user, token });
}

module.exports = { register };