// ...existing code...

const express = require("express");
const router = express.Router();
const { getAppointment, getAppointmentById, updateAppointment, deleteAppointment, getAppointmentByPatientId, getAppointmentByDoctorId, getAppointmentByStatus, getAppointmentToday } = require("../controllers/AppointmentController");
const { protect, authorize } = require("../middleware/authMiddleware");
/**
 * @swagger
 * /appointments/today:
 *   get:
 *     summary: Get all appointments today
 *     tags: [Appointment]
 *     responses:
 *       200:
 *         description: List of appointments
 */
router.get("/today", protect, authorize("Admin", "Receptionist"), getAppointmentToday);

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
// Cho phép cả bệnh nhân và nhân viên hủy lịch
router.put("/:id", protect, (req, res, next) => {
	if (req.userType === "employee") {
		return authorize("Admin", "Receptionist")(req, res, next);
	}
	if (req.userType === "patient") {
		// Chỉ cho phép bệnh nhân hủy lịch của chính mình
		const appointmentId = parseInt(req.params.id);
		// Lấy appointment để kiểm tra
		const { Appointment } = require("../models");
		Appointment.findByPk(appointmentId).then(app => {
			if (!app) return res.status(404).json({ error: "Appointment not found" });
			if (app.patientId !== req.userId) {
				return res.status(403).json({ error: "Bạn chỉ được hủy lịch của chính mình" });
			}
			next();
		}).catch(err => {
			return res.status(500).json({ error: "Lỗi kiểm tra quyền hủy lịch" });
		});
		return;
	}
	return res.status(403).json({ error: "Không có quyền hủy lịch" });
}, updateAppointment);

// Cho phép cả bệnh nhân và nhân viên truy cập lịch khám của bệnh nhân
router.get("/patient/:id", protect, (req, res, next) => {
	// Nếu là employee thì kiểm tra quyền như cũ
	if (req.userType === "employee") {
		return authorize("Admin", "Receptionist", "Doctor")(req, res, next);
	}
	// Nếu là bệnh nhân thì chỉ cho phép xem lịch của chính mình
	if (req.userType === "patient") {
		if (parseInt(req.params.id) !== req.userId) {
			return res.status(403).json({ success: false, message: "Bạn chỉ được xem lịch khám của chính mình" });
		}
		return next();
	}
	// Các loại user khác bị chặn
	return res.status(403).json({ success: false, message: "Không có quyền truy cập" });
}, getAppointmentByPatientId);


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