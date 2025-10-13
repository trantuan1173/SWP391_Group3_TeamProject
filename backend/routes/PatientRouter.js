const express = require("express");
const router = express.Router();
const {
    patientLogin,
  register,
  createAppointment,
  getPrescriptions,
  getCheckups,
  getDocuments,
  getPatientById,
  updatePatient,
  createAppointmentWithoutLogin,
  confirmAppointment
} = require("../controllers/PatientController");
const { protect } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Patient
 *   description: Quản lý bệnh nhân
 */

/**
 * @swagger
 * /patients/login:
 *   post:
 *     summary: Login a patient
 *     tags: [Patient]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient logged in successfully
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Failed to login
 */
router.post("/login", patientLogin);

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

/**
 * @swagger
 * /patients/appointments:
 *   post:
 *     summary: Create an appointment
 *     tags: [Patient]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: integer
 *               date:
 *                 type: string
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       500:
 *         description: Failed to create appointment
 */
// Require authentication for creating an appointment as a logged-in patient
router.post("/appointments", protect, createAppointment);

/**
 * @swagger
 * /patients/appointmentsWithoutLogin:
 *   post:
 *     summary: Create an appointment without login
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
 *               identityNumber:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               date:
 *                 type: string
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       500:
 *         description: Failed to create appointment
 */
router.post("/appointmentsWithoutLogin", createAppointmentWithoutLogin);

/**
 * @swagger
 * /patients/confirmAppointment:
 *   post:
 *     summary: Confirm an appointment
 *     tags: [Patient]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               doctorId:
 *                 type: integer
 *               date:
 *                 type: string
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment confirmed successfully
 *       500:
 *         description: Failed to confirm appointment
 */
router.post("/confirmAppointment", confirmAppointment);

/**
 * @swagger
 * /patients/prescriptions/{patientId}:
 *   get:
 *     summary: Get prescriptions by patient ID
 *     tags: [Patient]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Prescriptions retrieved successfully
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Failed to fetch prescriptions
 */
router.get("/prescriptions/:patientId", getPrescriptions);

/**
  * @swagger
 * /patients/checkups/{patientId}:
 *   get:
 *     summary: Get checkups by patient ID
 *     tags: [Patient]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Checkups retrieved successfully
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Failed to fetch checkups
 */
router.get("/checkups/:patientId", getCheckups);

/**
 * @swagger
 * /patients/documents/{patientId}:
 *   get:
 *     summary: Get documents by patient ID
 *     tags: [Patient]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Failed to fetch documents
 */
router.get("/documents/:patientId", getDocuments);

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     tags: [Patient]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient retrieved successfully
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Failed to fetch patient
 */
// Protect the patient profile route: only authenticated users
router.get("/:id", protect, getPatientById);

// Update patient profile
router.put('/:id', protect, updatePatient);

module.exports = router;
