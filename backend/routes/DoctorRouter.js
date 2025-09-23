const express = require("express");
const router = express.Router();
const { register, getDoctor, getDoctorById, updateDoctor, deleteDoctor, getDoctorAvailable } = require("../controllers/DoctorController");
const { protect, authorize } = require("../middleware/authMiddleware.js");

/**
 * @swagger
 * tags:
 *   name: Doctor
 *   description: Quản lý bác sĩ
 */

/**
 * @swagger
 * /doctors:
 *   get:
 *     summary: Get all doctors
 *     tags: [Doctor]
 *     responses:
 *       200:
 *         description: List of doctors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Doctor'
 */
router.get("/", getDoctor);
/**
 * @swagger
 * /doctors/{id}:
 *   get:
 *     summary: Get a doctor by ID
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Doctor found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 */
router.get("/:id", protect, authorize("admin"), getDoctorById);

/**
 * @swagger
 * /doctors/{id}:
 *   put:
 *     summary: Update a doctor by ID
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               identityNumber:
 *                 type: string
 *                 example: "123456789"
 *               phoneNumber:
 *                 type: string
 *                 example: "123456789"
 *               speciality:
 *                 type: string
 *                 example: "Cardiology"
 *               dateOfBirth:
 *                 type: string
 *                 example: "2000-01-01"
 *               gender:
 *                 type: string
 *                 example: "male"
 *               address:
 *                 type: string
 *                 example: "123 Main St"
 *     responses:
 *       200:
 *         description: Doctor updated successfully
 *       500:
 *         description: Failed to update doctor
 */
router.put("/:id", protect, authorize("admin"), updateDoctor);

/**
 * @swagger
 * /doctors/{id}:
 *   delete:
 *     summary: Delete a doctor by ID
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Doctor deleted successfully
 *       500:
 *         description: Failed to delete doctor
 */
router.delete("/:id", protect, authorize("admin" || "doctor"), deleteDoctor);

/**
 * @swagger
 * /doctors/register:
 *   post:
 *     summary: Register a new doctor
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "123"
 *               identityNumber:
 *                 type: string
 *                 example: "123456789"
 *               phoneNumber:
 *                 type: string
 *                 example: "123456789"
 *               speciality:
 *                 type: string
 *                 example: "Cardiology"
 *               dateOfBirth:
 *                 type: datetime
 *                 example: "2025-09-14"
 *               gender:
 *                 type: string
 *                 example: "male"
 *               address:
 *                 type: string
 *                 example: "123 Main St"
 *     responses:
 *       201:
 *         description: Doctor registered successfully
 *       200:
 *         description: Doctor updated role successfully
 *       500:
 *         description: Failed to register doctor
 */
router.post("/register", register);

/**
 * @swagger
 * /doctors/available:
 *   post:
 *     summary: Get available doctors
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               speciality:
 *                 type: string
 *                 example: "Cardiology"
 *               date:
 *                 type: string
 *                 example: "2025-09-14"
 *               startTime:
 *                 type: datetime
 *                 example: "08:00:00"
 *               endTime:
 *                 type: datetime
 *                 example: "17:00:00"
 *     responses:
 *       200:
 *         description: List of available doctors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Doctor'
 */
router.post("/available", getDoctorAvailable);
module.exports = router;