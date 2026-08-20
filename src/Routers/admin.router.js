const express = require("express");

const {
  getUserById,
  updateUserRole,
  deleteUser,
  deleteItem,
  changeItemStatus,
} = require("../controllers/admin.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/users/:id", getUserById);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);
router.delete("/items/:id", deleteItem);
router.patch("/items/:id/status", changeItemStatus);

module.exports = router;