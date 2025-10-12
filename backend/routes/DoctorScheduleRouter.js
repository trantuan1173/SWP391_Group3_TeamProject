const express = require("express");
const router = express.Router();
const {
  getDoctorSchedule,
  createDoctorSchedule,
  updateDoctorSchedule,
  deleteDoctorSchedule
} = require("../controllers/DoctorScheduleController");
const { protect, authorize } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: DoctorSchedule
 *   description: Quản lý lịch làm việc bác sĩ
 */

/**
 * @swagger
 * /doctor-schedules/{doctorId}:
 *   get:
 *     summary: Lấy lịch làm việc của bác sĩ
 *     tags: [DoctorSchedule]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách lịch làm việc
 */
router.get("/:doctorId", getDoctorSchedule);

/**
 * @swagger
 * /doctor-schedules:
 *   post:
 *     summary: Tạo lịch làm việc mới
 *     tags: [DoctorSchedule]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctorId:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               roomId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Tạo lịch thành công
 */
router.post("/", protect, authorize("doctor", "admin"), createDoctorSchedule);

/**
 * @swagger
 * /doctor-schedules/{id}:
 *   put:
 *     summary: Cập nhật lịch làm việc
 *     tags: [DoctorSchedule]
 *     security:
 *       - bearerAuth: []
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
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               roomId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put("/:id", protect, authorize("doctor", "admin"), updateDoctorSchedule);

/**
 * @swagger
 * /doctor-schedules/{id}:
 *   delete:
 *     summary: Xóa lịch làm việc
 *     tags: [DoctorSchedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete("/:id", protect, authorize("doctor", "admin"), deleteDoctorSchedule);

module.exports = router;
