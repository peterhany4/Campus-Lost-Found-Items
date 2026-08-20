const express = require("express");

const { createItem, getAllItems, getItemById, updateItem, deleteItem } = require("../controllers/item.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/", protect, createItem);
router.get("/", getAllItems);
router.get("/:id", getItemById);
router.patch("/:id", protect, updateItem);
router.delete("/:id", protect, deleteItem);

module.exports = router;