const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// GET /api/users/profile
router.get('/profile', protect, (req, res) => {
  // req.user and req.userType are set by protect middleware
  try {
    const payload = {};
    if (req.userType === 'employee') {
      payload.employee = req.user;
    } else if (req.userType === 'patient') {
      payload.patient = req.user;
    } else {
      payload.user = req.user;
    }
    res.json(payload);
  } catch (err) {
    console.error('[UserRouter] profile error', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;
