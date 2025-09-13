const express = require("express");
const router = express.Router();
const { register, getStaff, getStaffById, updateStaff, deleteStaff } = require("../controllers/StaffController");

/**
 * @swagger
 * tags:
 *   name: Staff
 *   description: Quản lý nhân viên
 */

/**
 * @swagger
 * /staffs/register:
 *   post:
 *     summary: Register a new staff
 *     tags: [Staff]
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
 *               dateOfBirth:
 *                 type: string
 *               gender:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Staff registered successfully
 *       409:
 *         description: Identity number already exists
 *       500:
 *         description: Failed to register staff
 */
router.post("/register", register);

/**
 * @swagger
 * /staffs:
 *   get:
 *     summary: Get all staff
 *     tags: [Staff]
 *     responses:
 *       200:
 *         description: List of staff
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Staff'
 */
router.get("/", getStaff);

/**
 * @swagger
 * /staffs/{id}:
 *   get:
 *     summary: Get a staff by ID
 *     tags: [Staff]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Staff found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Staff'
 */
router.get("/:id", getStaffById);

/**
 * @swagger
 * /staffs/{id}:
 *   put:
 *     summary: Update a staff by ID
 *     tags: [Staff]
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
 *               email:
 *                 type: string
 *               identityNumber:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               speciality:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *               gender:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Staff updated successfully
 *       500:
 *         description: Failed to update staff
 */
router.put("/:id", updateStaff);

/**
 * @swagger
 * /staffs/{id}:
 *   delete:
 *     summary: Delete a staff by ID
 *     tags: [Staff]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Staff deleted successfully
 *       500:
 *         description: Failed to delete staff
 */
router.delete("/:id", deleteStaff);

module.exports = router;