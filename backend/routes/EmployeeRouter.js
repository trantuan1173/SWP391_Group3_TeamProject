const express = require("express");
const router = express.Router();
const { employeeLogin, authProfile } = require("../controllers/EmployeeController");

/**
 * @swagger
 * tags:
 *   name: Employee
 *   description: Quản lý người dùng
 */

/**
 * @swagger
 * /employees/login:
 *   post:
 *     summary: Login a user
 *     tags: [Employee]
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
 *         description: User logged in successfully
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Failed to login
 */
router.post("/login", employeeLogin);

/**
 * @swagger
 * /employees/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Employee]
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *       500:
 *         description: Failed to fetch user profile
 */
router.get("/profile", authProfile);

module.exports = router;