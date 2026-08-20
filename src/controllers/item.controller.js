const Item = require("../models/item.model");
const AppError = require("../utils/AppError");

async function createItem(req, res, next) {
  const { title, description, type, category, location } = req.body;

  if (!title || !description || !type || !category || !location) {
    return next(
      new AppError(
        400,
        "Please provide title, description, type, category and location"
      )
    );
  }

  const item = await Item.create({
    title,
    description,
    type,
    category,
    location,
    user: req.user._id,
  });

  res.status(201).json({ item });
}

async function getAllItems(req, res, next) {
  const items = await Item.find().populate("user", "name email");

  res.status(200).json({ count: items.length, items });
}

async function getItemById(req, res, next) {
  const item = await Item.findById(req.params.id).populate("user", "name email");

  if (!item) {
    return next(new AppError(404, "Item not found"));
  }

  res.status(200).json({ item });
}

const allowedFields = ["title", "description", "category", "location", "status"];

async function updateItem(req, res, next) {
  const item = await Item.findById(req.params.id).populate("user", "name email");

  if (!item) {
    return next(new AppError(404, "Item not found"));
  }

  if (item.user._id.toString() !== req.user._id.toString()) {
    return next(new AppError(403, "You are not the owner of this item"));
  }

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      item[field] = req.body[field];
    }
  });

  await item.save();

  res.status(200).json({ item });
}

async function deleteItem(req, res, next) {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return next(new AppError(404, "Item not found"));
  }

  if (item.user.toString() !== req.user._id.toString()) {
    return next(new AppError(403, "You are not the owner of this item"));
  }

  await Item.findByIdAndDelete(req.params.id);

  res.status(204).send();
}

module.exports = { createItem, getAllItems, getItemById, updateItem, deleteItem };