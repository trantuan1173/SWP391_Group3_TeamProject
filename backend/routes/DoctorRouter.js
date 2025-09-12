const express = require("express");
const router = express.Router();
const { register } = require("../controllers/DoctorController");

/**
 * @swagger
 * /doctor/register:
 *   post:
 *     summary: Register a new doctor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               identityNumber:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               speciality:
 *                 type: string
 *               workingHours:
 *                 type: string
 *     responses:
 *       201:
 *         description: Doctor registered successfully
 *       500:
 *         description: Failed to register doctor
 */
router.post("/register", register);

module.exports = router;