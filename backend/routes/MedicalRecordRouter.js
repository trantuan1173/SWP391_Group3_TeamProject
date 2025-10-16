const express = require("express");
const router = express.Router();
const { getAllMedicalRecordByPatientId, getAllMedicalRecordByAppointmentId, getMedicalRecordById, createMedicalRecord, updateMedicalRecord, deleteMedicalRecord,getMedicalRecordsByDoctor,getPatientsByDoctorV ,getPatientsByDoctor , getAllPatients } = require("../controllers/MedicalRecordController");
const { protect, authorize } = require("../middleware/authMiddleware");

/**
 * @swagger
 * /medical-records/doctor/{doctorId}:
 *   get:
 *     summary: Lấy tất cả hồ sơ khám của bác sĩ
 *     tags: [Medical Record]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: integer
 *         description: Lọc theo bệnh nhân (optional)
 *     responses:
 *       200:
 *         description: Danh sách hồ sơ khám
 */
router.get("/doctor/:doctorId", protect, authorize("Doctor", "Admin"), getMedicalRecordsByDoctor);

/**
 * @swagger
 * /medical-records/doctor/{doctorId}/patients:
 *   get:
 *     summary: Lấy danh sách bệnh nhân đã từng khám của bác sĩ
 *     tags: [Medical Record]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách bệnh nhân
 */
router.get("/doctor/:doctorId/patients", protect, authorize("Doctor", "Admin"), getPatientsByDoctorV);

router.get("/doctor/:doctorId/patient", protect, authorize("Doctor", "Admin"), getPatientsByDoctor);

router.get("/patients", protect, authorize("Doctor", "Admin"), getAllPatients);

/**
 * @swagger
 * /medical-records/patient/{patientId}:
 *   get:
 *     summary: Get all medical records by patient ID
 *     tags: [Medical Record]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of medical records
 *       404:
 *         description: Medical records not found
 *       500:
 *         description: Failed to get medical records
 */
router.get("/patient/:patientId", getAllMedicalRecordByPatientId);

/**
 * @swagger
 * /medical-records/appointment/{appointmentId}:
 *   get:
 *     summary: Get all medical records by appointment ID
 *     tags: [Medical Record]
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of medical records
 *       404:
 *         description: Medical records not found
 *       500:
 *         description: Failed to get medical records
 */
router.get("/appointment/:appointmentId", getAllMedicalRecordByAppointmentId);

/**
 * @swagger
 * /medical-records/{id}:
 *   get:
 *     summary: Get a medical record by ID
 *     tags: [Medical Record]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Medical record found successfully
 *       404:
 *         description: Medical record not found
 *       500:
 *         description: Failed to get medical record
 */
router.get("/:id", getMedicalRecordById);

/**
 * @swagger
 * /medical-records:
 *   post:
 *     summary: Create a new medical record
 *     tags: [Medical Record]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: integer
 *                 example: 1
 *               doctorId:
 *                 type: integer
 *                 example: 1
 *               appointmentId:
 *                 type: integer
 *                 example: 1
 *               symptoms:
 *                 type: string
 *                 example: "Symptoms"
 *               diagnosis:
 *                 type: string
 *                 example: "Diagnosis"
 *               treatment:
 *                 type: string
 *                 example: "Treatment"
 *               services:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     serviceId:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 1
 *                     total:
 *                       type: number
 *                       example: 100
 *     responses:
 *       201:
 *         description: Medical record created successfully
 *       400:
 *         description: Medical record already exists
 *       500:
 *         description: Failed to create medical record
 */
router.post("/", protect, authorize("Admin", "Doctor"), createMedicalRecord);

/**
 * @swagger
 * /medical-records/{id}:
 *   put:
 *     summary: Update a medical record by ID
 *     tags: [Medical Record]
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
 *               patientId:
 *                 type: integer
 *                 example: 1
 *               doctorId:
 *                 type: integer
 *                 example: 1
 *               appointmentId:
 *                 type: integer
 *                 example: 1
 *               symptoms:
 *                 type: string
 *                 example: "Symptoms"
 *               diagnosis:
 *                 type: string
 *                 example: "Diagnosis"
 *               treatment:
 *                 type: string
 *                 example: "Treatment"
 *               services:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     serviceId:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 1
 *                     total:
 *                       type: number
 *                       example: 100
 *     responses:
 *       200:
 *         description: Medical record updated successfully
 *       404:
 *         description: Medical record not found
 *       500:
 *         description: Failed to update medical record
 */
router.put("/:id", protect, authorize("Admin", "Doctor"), updateMedicalRecord);

/**
 * @swagger
 * /medical-records/{id}:
 *   delete:
 *     summary: Delete a medical record by ID
 *     tags: [Medical Record]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Medical record deleted successfully
 *       404:
 *         description: Medical record not found
 *       500:
 *         description: Failed to delete medical record
 */
router.delete("/:id", protect, authorize("Admin"), deleteMedicalRecord);

module.exports = router;
