const express = require("express");
const router = express.Router();
const { getAppointment, getAppointmentById, updateAppointment, deleteAppointment, getAppointmentByPatientId, getAppointmentByDoctorId, getAppointmentByStatus } = require("../controllers/AppointmentController");
const { protect, authorize } = require("../middleware/authMiddleware");
/**
 * @swagger
 * tags:
 *   name: Appointment
 *   description: Quản lý lịch hẹn
 */

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Get all appointments
 *     tags: [Appointment]
 *     responses:
 *       200:
 *         description: List of appointments
 */
router.get("/", protect, authorize("Admin", "Receptionist"), getAppointment);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get an appointment by ID
 *     tags: [Appointment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Appointment found
 */
router.get("/:id", protect, authorize("Admin", "Receptionist"), getAppointmentById);

/**
 * @swagger
 * /appointments/{id}:
 *   put:
 *     summary: Update an appointment by ID
 *     tags: [Appointment]
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
 *               status:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *               gender:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       500:
 *         description: Failed to update appointment
 */
router.put("/:id", protect, authorize("Admin", "Receptionist"), updateAppointment);

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Delete an appointment by ID
 *     tags: [Appointment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Appointment deleted successfully
 *       500:
 *         description: Failed to delete appointment
 */
router.delete("/:id", protect, authorize("Admin", "Receptionist"), deleteAppointment);

/**
 * @swagger
 * /appointments/patient/{id}:
 *   get:
 *     summary: Get appointments by patient ID
 *     tags: [Appointment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of appointments
 */
router.get("/patient/:id", protect, authorize("Admin", "Receptionist", "Doctor"), getAppointmentByPatientId);

/**
 * @swagger
 * /appointments/doctor/{id}:
 *   get:
 *     summary: Get appointments by doctor ID
 *     tags: [Appointment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of appointments
 */
router.get("/doctor/:id", protect, authorize("Admin", "Receptionist", "Doctor"), getAppointmentByDoctorId);

/**
 * @swagger
 * /appointments/status/{status}:
 *   get:
 *     summary: Get appointments by status
 *     tags: [Appointment]
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of appointments
 */
router.get("/status/:status", protect, authorize("Admin", "Receptionist", "Doctor"), getAppointmentByStatus);

module.exports = router;