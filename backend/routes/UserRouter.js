const express = require("express");
const router = express.Router();
const { register, login, verifyUser, authProfile } = require("../controllers/UserController");

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Quản lý người dùng
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
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
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Failed to register user
 */
router.post("/register", register);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login a user
 *     tags: [User]
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
router.post("/login", login);

/**
 * @swagger
 * /users/verify:
 *   post:
 *     summary: Verify a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: User verified successfully
 *       401:
 *         description: Invalid OTP
 *       500:
 *         description: Failed to verify user
 */
router.post("/verify", verifyUser);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *       500:
 *         description: Failed to fetch user profile
 */
router.get("/profile", authProfile);

module.exports = router;