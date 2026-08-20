const Category = require("../models/category.model");
const AppError = require("../utils/AppError");

async function getAllCategories(req, res, next) {
  const categories = await Category.find().sort({ name: 1 });

  res.status(200).json({ count: categories.length, categories });
}

async function createCategory(req, res, next) {
  const { name } = req.body;

  if (typeof name !== "string" || name.trim().length === 0) {
    return next(new AppError(400, "Category name is required"));
  }

  const existing = await Category.findOne({ name });
  if (existing) {
    return next(new AppError(409, `Category "${name}" already exists`));
  }

  const category = await Category.create({ name });

  res.status(201).json({ category });
}

async function updateCategory(req, res, next) {
  const { name } = req.body;

  if (typeof name !== "string" || name.trim().length === 0) {
    return next(new AppError(400, "Category name is required"));
  }

  const existing = await Category.findOne({ name });
  if (existing && existing._id.toString() !== req.params.id) {
    return next(new AppError(409, `Category "${name}" already exists`));
  }

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name },
    { new: true, runValidators: true }
  );

  if (!category) {
    return next(new AppError(404, "Category not found"));
  }

  res.status(200).json({ category });
}

async function deleteCategory(req, res, next) {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return next(new AppError(404, "Category not found"));
  }

  res.status(204).send();
}

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};