const Item = require("../models/item.model");
const AppError = require("../utils/AppError");
const path = require("path");
const fs = require("fs");

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
  const filter = {};
  const {
    title,
    description,
    category,
    type,
    location,
    status,
    from,
    to,
    page: pageQuery,
    limit: limitQuery,
  } = req.query;

  if (title !== undefined) {
    filter.title = { $regex: title, $options: "i" };
  }

  if (description !== undefined) {
    filter.description = { $regex: description, $options: "i" };
  }

  if (category !== undefined) {
    filter.category = { $regex: category, $options: "i" };
  }

  if (type !== undefined) {
    if (!["lost", "found"].includes(type)) {
      return next(new AppError(400, "Type must be either 'lost' or 'found'"));
    }
    filter.type = type;
  }

  if (location !== undefined) {
    filter.location = location;
  }

  if (status !== undefined) {
    if (!["ACTIVE", "RECOVERED"].includes(status)) {
      return next(new AppError(400, "Status must be either 'ACTIVE' or 'RECOVERED'"));
    }
    filter.status = status;
  }

  if (from !== undefined || to !== undefined) {
    filter.createdAt = {};

    if (from !== undefined) {
      const fromDate = new Date(from);
      if (Number.isNaN(fromDate.getTime())) {
        return next(new AppError(400, "Invalid 'from' date"));
      }
      filter.createdAt.$gte = fromDate;
    }

    if (to !== undefined) {
      const toDate = new Date(to);
      if (Number.isNaN(toDate.getTime())) {
        return next(new AppError(400, "Invalid 'to' date"));
      }
      filter.createdAt.$lte = toDate;
    }
  }

  const page = pageQuery === undefined ? 1 : Number(pageQuery);
  if (!Number.isInteger(page) || page <= 0) {
    return next(new AppError(400, "Page must be a positive integer"));
  }

  let limit = limitQuery === undefined ? 10 : Number(limitQuery);
  if (!Number.isInteger(limit) || limit <= 0) {
    return next(new AppError(400, "Limit must be a positive integer"));
  }
  limit = Math.min(limit, 100);

  const total = await Item.countDocuments(filter);
  const items = await Item.find(filter)
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    count: items.length,
    items,
    page,
    limit,
    totalPages,
  });
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

async function uploadItemImages(req, res, next) {
  const item = await Item.findById(req.params.id).populate("user", "name email");

  if (!item) {
    return next(new AppError(404, "Item not found"));
  }

  if (item.user._id.toString() !== req.user._id.toString()) {
    return next(new AppError(403, "You are not the owner of this item"));
  }

  if (!req.files || req.files.length === 0) {
    return next(new AppError(400, "Please upload at least one image"));
  }

  const imageUrls = req.files.map(
    (file) => `/uploads/${file.filename}`
  );

  item.images.push(...imageUrls);

  await item.save();

  res.status(200).json({ item });
}

async function deleteItemImage(req, res, next) {
  const item = await Item.findById(req.params.id).populate("user", "name email");

  if (!item) {
    return next(new AppError(404, "Item not found"));
  }

  if (item.user._id.toString() !== req.user._id.toString()) {
    return next(new AppError(403, "You are not the owner of this item"));
  }

  const url = `/uploads/${req.params.filename}`;

  if (!item.images.includes(url)) {
    return next(new AppError(404, "Image not found on this item"));
  }

  item.images = item.images.filter((img) => img !== url);
  await item.save();

  try {
    fs.unlinkSync(path.join("uploads", req.params.filename));
  } catch (error) {
    // file already gone from disk — not fatal
  }

  res.status(200).json({ item });
}

module.exports = { createItem, getAllItems, getItemById, updateItem, deleteItem, uploadItemImages, deleteItemImage };