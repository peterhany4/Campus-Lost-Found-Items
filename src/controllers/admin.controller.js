const User = require("../models/user.model");
const Item = require("../models/item.model");
const AppError = require("../utils/AppError");

async function getUserById(req, res, next) {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError(404, "User not found"));
  }

  res.status(200).json({ user });
}

async function updateUserRole(req, res, next) {
  const { role } = req.body;

  if (!["student", "admin"].includes(role)) {
    return next(new AppError(400, "Role must be 'student' or 'admin'"));
  }

  if (req.params.id === req.user._id.toString()) {
    return next(new AppError(400, "You cannot change your own role"));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError(404, "User not found"));
  }

  res.status(200).json({ user });
}

async function deleteUser(req, res, next) {
  if (req.params.id === req.user._id.toString()) {
    return next(new AppError(400, "You cannot delete your own account"));
  }

  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError(404, "User not found"));
  }

  res.status(204).send();
}

async function deleteItem(req, res, next) {
  const item = await Item.findByIdAndDelete(req.params.id);

  if (!item) {
    return next(new AppError(404, "Item not found"));
  }

  res.status(204).send();
}

async function changeItemStatus(req, res, next) {
  const { status } = req.body;

  if (!["ACTIVE", "RECOVERED"].includes(status)) {
    return next(new AppError(400, "Status must be 'ACTIVE' or 'RECOVERED'"));
  }

  const item = await Item.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!item) {
    return next(new AppError(404, "Item not found"));
  }

  res.status(200).json({ item });
}

module.exports = { getUserById, updateUserRole, deleteUser, deleteItem, changeItemStatus };