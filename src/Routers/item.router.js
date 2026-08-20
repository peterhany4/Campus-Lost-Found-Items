const express = require("express");

const { createItem, getAllItems, getItemById, updateItem, deleteItem, uploadItemImages, deleteItemImage } = require("../controllers/item.controller");
const { protect } = require("../middlewares/auth.middleware");
const { uploadImages } = require("../middlewares/upload.middleware");

const router = express.Router();

router.post("/", protect, createItem);
router.get("/", getAllItems);
router.get("/:id", getItemById);
router.patch("/:id", protect, updateItem);
router.delete("/:id", protect, deleteItem);
router.post("/:id/images", protect, uploadImages, uploadItemImages);
router.delete("/:id/images/:filename", protect, deleteItemImage);

module.exports = router;