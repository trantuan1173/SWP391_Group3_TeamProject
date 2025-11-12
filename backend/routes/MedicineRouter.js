const express = require("express");
const router = express.Router();
const {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  getExpiringMedicines,
} = require("../controllers/MedicineController");
const { authorize, protect } = require("../middleware/authMiddleware");

// Route cho lễ tân CRUD thuốc
router.post(
  "/create",
  protect,
  authorize("receptionist", "admin"),
  createMedicine
); // Thêm thuốc
router.get("/", getMedicines); // Lấy danh sách
router.get("/:id", getMedicineById); // Lấy 1 thuốc
router.put("/update/:id", updateMedicine); // Cập nhật
router.delete("/delete/:id", deleteMedicine); // Xóa
router.get("/expiring/soon", getExpiringMedicines); // Thuốc sắp hết hạn

module.exports = router;
