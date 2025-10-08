const Employee = require("../models/Employee");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const { Staff } = require("../models");
const { Op } = require("sequelize");
const Role = require("../models/Role");
const EmployeeRole = require("../models/EmployeeRole");
const { sendStaffVerifyEmail } = require("../service/sendVerifyEmail");

//Create role
const createRole = async (req, res) => {
  try {
    const { name } = req.body;
    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      return res.status(400).json({ error: "Role already exists" });
    }
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    const role = await Role.create({ name });
    res.status(201).json({ message: "Role created", role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create role" });
  }
};

//Get all roles
const getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
};

//Update role
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }
    role.name = name;
    await role.save();
    res.json({ message: "Role updated", role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update role" });
  }
};

//Delete role
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }
    await role.destroy();
    res.json({ message: "Role deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete role" });
  }
};

//Create employee
const createEmployee = async (req, res) => {
  try {
    const { role, ...userData } = req.body;

    const existingIdentityNumber = await Employee.findOne({ where: { identityNumber: userData.identityNumber } });
    const existingMail = await Employee.findOne({ where: { email: userData.email } });
    const existingPhone = await Employee.findOne({ where: { phoneNumber: userData.phoneNumber } });

    if (existingIdentityNumber || existingMail || existingPhone) {
      if (existingIdentityNumber)
        return res.status(409).json({ error: "Identity number already exists" });
      if (existingMail)
        return res.status(409).json({ error: "Email already exists" });
      if (existingPhone)
        return res.status(409).json({ error: "Phone number already exists" });
    }

    if (req.file) {
      userData.avatar = `/uploads/avatars/${req.file.filename}`;
    }
    if (!userData.name || !userData.email || !userData.password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    const employee = await Employee.create({ ...userData });

    if (role === "doctor") {
      await Doctor.create({
        userId: employee.id,
        speciality: "",
        workingHours: "",
      });
    }

    const roleRecord = await Role.findOne({ where: { name: role } });
    if (!roleRecord) {
      return res.status(404).json({ error: `Role '${role}' not found` });
    }

    await EmployeeRole.create({
      employeeId: employee.id,
      roleId: roleRecord.id,
    });

    await sendStaffVerifyEmail(employee.email, userData.password);

    const cleanEmployee = employee.get({ plain: true });
    const cleanRole = roleRecord.get({ plain: true });

    const responseData = {
      id: cleanEmployee.id,
      name: cleanEmployee.name,
      email: cleanEmployee.email,
      phoneNumber: cleanEmployee.phoneNumber,
      identityNumber: cleanEmployee.identityNumber,
      dateOfBirth: cleanEmployee.dateOfBirth,
      gender: cleanEmployee.gender,
      address: cleanEmployee.address,
      avatar: cleanEmployee.avatar,
      isActive: cleanEmployee.isActive,
      role: {
        id: cleanRole.id,
        name: cleanRole.name,
      },
      createdAt: cleanEmployee.createdAt,
      updatedAt: cleanEmployee.updatedAt,
    };

    res.status(201).json({
      message: "Employee created successfully",
      employee: responseData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create employee" });
  }
};

//Get all employees with role
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      attributes: [
        "id",
        "name",
        "email",
        "isActive",
        "phoneNumber",
        "avatar",
        "dateOfBirth",
        "gender",
        "address",
        "identityNumber",
      ],
      include: [{ model: Role }],
    });

    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

//Const Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Employee.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "Employee not found" });

    res.json({ message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete employee" });
  }
};

//Const Get Employee By Id
const getEmployeeById = async (req, res) => {
  try {
    const user = await Employee.findByPk(req.params.id, {
      include: [{ model: Role }],
    });
    if (!user) return res.status(404).json({ error: "Employee not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch employee" });
  }
};

// const updateActiveStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { isActive } = req.body;

//     const user = await Employee.findByPk(id);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Ép kiểu boolean
//     user.isActive = isActive === true || isActive === "true";

//     await user.save();

//     res.json({ message: "User status updated", isActive: user.isActive });
//   } catch (err) {
//     console.error("Update active status error:", err);
//     res
//       .status(500)
//       .json({ error: "Failed to update user status", details: err.message });
//   }
// };

// const updateEmployee = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const existingUser = await Employee.findOne({ where: { id } }, { include: [{ model: Role }] });
//     if (!existingUser) {
//       return res.status(404).json({ error: "Employee not found" });
//     }

//     const oldRole = existingUser.role.name;
//     const newRole = req.body.role;

//     const updateData = { ...req.body };

//     if (req.file) {
//       updateData.avatar = `/uploads/avatars/${req.file.filename}`;
//     }
//     if (!updateData.password || updateData.password.trim() === "") {
//       delete updateData.password;
//     } else {
//       const bcrypt = require("bcrypt");
//       updateData.password = await bcrypt.hash(updateData.password, 10);
//     }

//     // Cập nhật bảng Users
//     const [updated] = await Employee.update(updateData, { where: { id } });

//     if (!updated) {
//       return res.status(400).json({ error: "Failed to update user" });
//     }

//     // Nếu role thay đổi → xử lý các bảng con
//     if (newRole && newRole !== oldRole) {
//       if (oldRole === "doctor") {
//         await Doctor.destroy({ where: { userId: id } });
//       } else if (oldRole === "patient") {
//         await Patient.destroy({ where: { userId: id } });
//       } else if (oldRole === "staff") {
//         await Staff.destroy({ where: { userId: id } });
//       } else if (oldRole === "admin") {
//         await Admin.destroy({ where: { userId: id } });
//       }

//       if (newRole === "doctor") {
//         await Doctor.create({ userId: id, speciality: "", isAvailable: true });
//       } else if (newRole === "patient") {
//         await Patient.create({ userId: id });
//       } else if (newRole === "staff") {
//         await Staff.create({ userId: id });
//       } else if (newRole === "admin") {
//         await Admin.create({ userId: id });
//       }
//     }

//     const updatedUser = await Employee.findByPk(id, {
//       attributes: { exclude: ["password"] },
//     });

//     res.json({
//       message: "User updated successfully",
//       user: updatedUser,
//     });
//   } catch (err) {
//     console.error("Update user error:", err);
//     res.status(500).json({
//       error: "Failed to update user",
//       details: err.message,
//     });
//   }
// };

module.exports = {
  createRole,
  getRoles,
  updateRole,
  deleteRole,
  createEmployee,
  getEmployees,
  deleteEmployee,
  getEmployeeById,
};
