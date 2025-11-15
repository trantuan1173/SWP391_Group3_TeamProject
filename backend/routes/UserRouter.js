const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  changeProfileInfo,
  changePassword,
} = require("../controllers/AdminUserController");

router.get("/profile", protect, (req, res) => {
  try {
    const payload = {};
    if (req.userType === "employee") {
      payload.employee = req.user;
    } else if (req.userType === "patient") {
      payload.patient = req.user;
    } else {
      payload.user = req.user;
    }
    res.json(payload);
  } catch (err) {
    console.error(
      "[UserRouter] profile error",
      err && err.stack ? err.stack : err
    );
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.put("/change-profile-info", protect, changeProfileInfo);

router.put("/change-password", protect, changePassword);

module.exports = router;
