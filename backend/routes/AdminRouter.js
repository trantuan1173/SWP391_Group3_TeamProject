const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const { protect, authorize } = require("../middleware/authMiddleware.js");
const {
  createUser,
  getUsers,
  deleteUser,
  updateUser,
  getUserById,
} = require("../controllers/AdminUserController.js");

// ================== Multer config ==================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars"); // thư mục lưu avatar
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
// ===================================================

// routes
router.post(
  "/create-user",

  upload.single("avatar"), // middleware multer xử lý file
  createUser
);

router.get("/users", protect, authorize("admin"), getUsers);
router.get("/users/:id", protect, authorize("admin"), getUserById);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);
router.put(
  "/users/:id",
  protect,
  upload.single("avatar"),
  authorize("admin"),
  updateUser
);

module.exports = router;
