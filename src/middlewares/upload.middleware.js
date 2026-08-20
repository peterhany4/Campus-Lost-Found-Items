const multer = require("multer");
const path = require("path");
const fs = require("fs");

const AppError = require("../utils/AppError");

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 5;
const ALLOWED_MIMETYPES = ["image/jpeg", "image/png", "image/webp"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync("uploads", { recursive: true });
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(400, "Only JPG, PNG or WebP images are allowed"));
  }
};

const uploadImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
}).array("images", MAX_FILES);

module.exports = { uploadImages, MAX_FILE_SIZE, MAX_FILES };