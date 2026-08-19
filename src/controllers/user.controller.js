const User = require("../models/user.model");
const AppError = require("../utils/AppError");

async function getMe(req, res, next) {
  res.status(200).json(req.user);
}

async function updateMe(req, res, next) {
  const { name } = req.body;

  if (typeof name !== "string" || name.trim().length === 0) {
    return next(new AppError(400, "Name must be a non-empty string"));
  }

  req.user.name = name;
  await req.user.save();

  res.status(200).json(req.user);
}

async function getAllUsers(req, res, next) {
  const users = await User.find();

  res.status(200).json({ count: users.length, users });
}

module.exports = { getMe, updateMe, getAllUsers };