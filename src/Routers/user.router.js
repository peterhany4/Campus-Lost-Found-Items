const express = require("express");

const { getMe, updateMe, getAllUsers } = require("../controllers/user.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/me", getMe);
router.patch("/me", updateMe);
router.get("/", authorize("admin"), getAllUsers);

module.exports = router;