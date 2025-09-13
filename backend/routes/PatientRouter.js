const express = require("express");
const router = express.Router();
const { register} = require("../controllers/PatientController");

/**
 * @swagger
 * tags:
 *   name: Patient
 *   description: Quản lý bệnh nhân
 */

/**
 * @swagger
 * /patients/register:
 *   post:
 *     summary: Register a new patient
 *     tags: [Patient]
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
 *               dateOfBirth:
 *                 type: string
 *               gender:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Patient registered successfully
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Failed to register patient
 */
router.post("/register", register);


module.exports = router;