const express = require("express");
const router = express.Router();
const {
  getAllService,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getAllServicePagination,
} = require("../controllers/ServiceController");
const { protect, authorize } = require("../middleware/authMiddleware");

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Get all services
 *     tags: [Service]
 *     responses:
 *       200:
 *         description: A list of services
 *       404:
 *         description: Services not found
 *       500:
 *         description: Failed to get services
 */
router.get("/", getAllService);

router.get("/get-all", getAllServicePagination);

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Get a service by ID
 *     tags: [Service]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Service found successfully
 *       404:
 *         description: Service not found
 *       500:
 *         description: Failed to get service
 */
router.get("/:id", getServiceById);

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Create a new service
 *     tags: [Service]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Service Name"
 *               description:
 *                 type: string
 *                 example: "Service Description"
 *               price:
 *                 type: number
 *                 example: 100
 *     responses:
 *       201:
 *         description: Service created successfully
 *       400:
 *         description: Service already exists
 *       500:
 *         description: Failed to create service
 */
router.post("/", protect, authorize("Admin"), createService);

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Update a service by ID
 *     tags: [Service]
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
 *                 example: "Service Name"
 *               description:
 *                 type: string
 *                 example: "Service Description"
 *               price:
 *                 type: number
 *                 example: 100
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       404:
 *         description: Service not found
 *       500:
 *         description: Failed to update service
 */
router.put("/:id", protect, authorize("Admin"), updateService);

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Delete a service by ID
 *     tags: [Service]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *       404:
 *         description: Service not found
 *       500:
 *         description: Failed to delete service
 */
router.delete("/:id", protect, authorize("Admin"), deleteService);

module.exports = router;
