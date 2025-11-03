const express = require("express");
const router = express.Router();
const {
  createPayment,

  payosWebhook,
  deletePayment,
} = require("../controllers/paymentController");

router.post("/", createPayment);

router.post("/webhook", express.json(), payosWebhook);
router.post("/delete", deletePayment);

module.exports = router;
