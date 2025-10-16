const express = require("express");
const router = express.Router();
const { employeeLogin, getEmployeeWithRole , authProfile  } = require("../controllers/EmployeeController");
const EmployeeController = require('../controllers/EmployeeController');
const { protect } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Quản lý người dùng
 */

/**
 * @swagger
 * /employees/login:
 *   post:
 *     summary: Login a user
 *     tags: [Employees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: trantuan1172003@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Failed to login
 */
router.post("/login", employeeLogin);

/**
 * @swagger
 * /employees/{id}/with-role:
 *   get:
 *     summary: Lấy thông tin nhân viên kèm role
 *     tags: [Employees]
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
 *         description: Thông tin nhân viên và role
 */
router.get("/:id/with-role", getEmployeeWithRole);

/**
 * @swagger
 * /employees/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Employees]
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *       500:
 *         description: Failed to fetch user profile
 */
router.get("/profile", authProfile);

module.exports = router;