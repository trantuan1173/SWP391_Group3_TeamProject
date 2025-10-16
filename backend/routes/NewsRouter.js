const express = require("express");
const router = express.Router();
const { getNews, createNews, updateNews, deleteNews, getNewsById } = require("../controllers/NewsController");
const { protect, authorize } = require("../middleware/authMiddleware");

/**
 * @swagger
 * /news:
 *   get:
 *     summary: Get all news
 *     tags: [News]
 *     responses:
 *       200:
 *         description: List of news
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get("/", getNews);

/**
 * @swagger
 * /news:
 *   post:
 *     summary: Create a new news
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *               tag:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: News created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                 image:
 *                   type: string
 *                 createdBy:
 *                   type: integer
 *                 tag:
 *                   type: string
 *                 content:
 *                   type: string
 */
router.post("/", protect, authorize("Admin", "Receptionist"), createNews);

/**
 * @swagger
 * /news/{id}:
 *   put:
 *     summary: Update a news by ID
 *     tags: [News]
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
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *               createdBy:
 *                 type: integer
 *               tag:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: News updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                 image:
 *                   type: string
 *                 createdBy:
 *                   type: integer
 *                 tag:
 *                   type: string
 *                 content:
 *                   type: string
 */
router.put("/:id", protect, authorize("Admin", "Receptionist"), updateNews);

/**
 * @swagger
 * /news/{id}:
 *   get:
 *     summary: Get a news by ID
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: News retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 image:
 *                   type: string
 *                 createdBy:
 *                   type: integer
 *                 tag:
 *                   type: string
 *                 content:
 *                   type: string
 */
router.get("/:id", getNewsById);

/**
 * @swagger
 * /news/{id}:
 *   delete:
 *     summary: Delete a news by ID
 *     tags: [News]
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
 *         description: News deleted successfully
 */
router.delete("/:id", protect, authorize("Admin", "Receptionist"), deleteNews);

module.exports = router;