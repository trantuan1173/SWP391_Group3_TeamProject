const express = require("express");
const router = express.Router();

const {
  createPolicy,
  getPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
  getActivePolicyByCategory,
} = require("../controllers/PolicyController");

router.post("/", createPolicy);
router.get("/", getPolicies);
router.get("/:id", getPolicyById);
router.put("/:id", updatePolicy);
router.delete("/:id", deletePolicy);

router.get("/category/:category", getActivePolicyByCategory);

module.exports = router;
