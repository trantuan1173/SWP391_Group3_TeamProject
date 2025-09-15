const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware.js");
const {
  createUser,
  getUsers,
  deleteUser,
  updateUser,
  getUserById,
} = require("../controllers/AdminUserController.js");

router.post("/create-user", protect, authorize("admin"), createUser);
router.get("/users", protect, authorize("admin"), getUsers);
router.get("/users/:id", protect, authorize("admin"), getUserById);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);
router.put("/users/:id", protect, authorize("admin"), updateUser);
module.exports = router;
