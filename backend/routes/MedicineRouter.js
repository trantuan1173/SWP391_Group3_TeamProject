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

router.post(
  "/create",
  protect,
  authorize("receptionist", "admin"),
  createMedicine
);
router.get("/", getMedicines);
router.get("/:id", getMedicineById);
router.put("/update/:id", updateMedicine);
router.delete("/delete/:id", deleteMedicine);
router.get("/expiring/soon", getExpiringMedicines);

module.exports = router;
