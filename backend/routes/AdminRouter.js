const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const { protect, authorize } = require("../middleware/authMiddleware.js");
const {
  createRole,
  getRoles,
  updateRole,
  deleteRole,
  createEmployee,
  getEmployees,
} = require("../controllers/AdminUserController.js");

// ================== Multer config ==================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars"); // thư mục lưu avatar
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
// ===================================================

// routes
/**
 * @swagger
 * /admin/create-employee:
 *   post:
 *     summary: Create a new employee
 *     tags: [Admin]
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
 *               role:
 *                 type: string
 *                 example: "admin"
 *     responses:
 *       201:
 *         description: Employee created successfully
 *       400:
 *         description: Employee already exists
 *       500:
 *         description: Failed to create employee
 */
router.post(
  "/create-employee",

  upload.single("avatar"), // middleware multer xử lý file
  createEmployee
);

/**
 * @swagger
 * /admin/create-role:
 *   post:
 *     summary: Create a new role
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Admin"
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Role already exists
 *       500:
 *         description: Failed to create role
 */
router.post("/create-role", createRole);

/**
 * @swagger
 * /admin/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of roles
 *       404:
 *         description: Roles not found
 *       500:
 *         description: Failed to get roles
 */
router.get("/roles", getRoles);

/**
 * @swagger
 * /admin/roles/{id}:
 *   put:
 *     summary: Update a role
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Admin"
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       404:
 *         description: Role not found
 *       500:
 *         description: Failed to update role
 */
router.put("/roles/:id", updateRole);

/**
 * @swagger
 * /admin/roles/{id}:
 *   delete:
 *     summary: Delete a role
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       404:
 *         description: Role not found
 *       500:
 *         description: Failed to delete role
 */
router.delete("/roles/:id", deleteRole);

/**
 * @swagger
 * /admin/employees:
 *   get:
 *     summary: Get all employees
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of employees
 *       404:
 *         description: Employees not found
 *       500:
 *         description: Failed to get employees
 */
router.get("/employees", getEmployees);
// router.get("/users/:id", protect, authorize("admin"), getUserById);
// router.delete("/users/:id", protect, authorize("admin"), deleteUser);
// router.put(
//   "/users/update-status/:id",
//   protect,
//   authorize("admin"),
//   updateActiveStatus
// );
// router.put(
//   "/users/:id",
//   protect,
//   upload.single("avatar"),
//   authorize("admin"),
//   updateUser
// );

module.exports = router;
