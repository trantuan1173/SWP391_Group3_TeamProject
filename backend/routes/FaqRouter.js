const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware.js");
const {
  getCategorySummary,
  listFaq,
  getFaqById,
  createFaq,
  deleteFaq,
} = require("../controllers/FaqController");

router.get("/categories/summary", getCategorySummary);
router.get("/", listFaq);
router.get("/get-faq/:id", getFaqById);
router.post("/create", createFaq);
router.delete("/delete/:id", deleteFaq);

module.exports = router;
