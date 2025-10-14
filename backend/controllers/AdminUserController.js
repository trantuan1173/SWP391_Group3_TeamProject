const Employee = require("../models/Employee");

const Patient = require("../models/Patient");
const { Staff } = require("../models");
const { Op } = require("sequelize");
const Role = require("../models/Role");
const EmployeeRole = require("../models/EmployeeRole");
const { sendStaffVerifyEmail } = require("../service/sendVerifyEmail");
const bcrypt = require("bcrypt");

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

    const existingIdentityNumber = await Employee.findOne({
      where: { identityNumber: userData.identityNumber },
    });
    const existingMail = await Employee.findOne({
      where: { email: userData.email },
    });
    const existingPhone = await Employee.findOne({
      where: { phoneNumber: userData.phoneNumber },
    });

    if (existingIdentityNumber || existingMail || existingPhone) {
      if (existingIdentityNumber)
        return res
          .status(409)
          .json({ error: "Identity number already exists" });
      if (existingMail)
        return res.status(409).json({ error: "Email already exists" });
      if (existingPhone)
        return res.status(409).json({ error: "Phone number already exists" });
    }

    if (req.file) {
      userData.avatar = `/uploads/avatars/${req.file.filename}`;
    }
    if (!userData.name || !userData.email || !userData.password) {
      return res
        .status(400)
        .json({ error: "Name, email and password are required" });
    }

    const employee = await Employee.create({ ...userData });
    // if (role === "doctor") {
    //   await Doctor.create({
    //     employeeId: employee.id,
    //     speciality: "",
    //     workingHours: "",
    //   });
    // }

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
    // Lấy query params
    const page = parseInt(req.query.page) || 1; // trang hiện tại
    const pageSize = parseInt(req.query.pageSize) || 10; // số record mỗi trang
    const search = req.query.search ? req.query.search.trim() : ""; // từ khóa tìm kiếm

    const offset = (page - 1) * pageSize;

    // Điều kiện where cho search
    const whereCondition = {};

    if (search) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phoneNumber: { [Op.like]: `%${search}%` } },
        { identityNumber: { [Op.like]: `%${search}%` } },
      ];
    }

    // Query với phân trang + count tổng
    const { rows: employees, count: total } = await Employee.findAndCountAll({
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
      include: [{ model: Role, as: "roles", attributes: ["name"] }],
      where: whereCondition,
      limit: pageSize,
      offset,
      order: [["createdAt", "DESC"]],
      subQuery: false,
    });

    res.json({
      employees,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    });
  } catch (err) {
    console.error("getEmployees error:", err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};

//Const Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    await EmployeeRole.destroy({ where: { employeeId: id } });
    // await Doctor.destroy({ where: { employeeId: id } });
    // await Patient.destroy({ where: { employeeId: id } });
    const deleted = await Employee.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "Employee not found" });

    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Delete employee error:", err);
    res.status(500).json({ error: "Failed to delete employee" });
  }
};

//Const Get Employee By Id
const getEmployeeById = async (req, res) => {
  try {
    const user = await Employee.findByPk(req.params.id, {
      include: [{ model: Role, as: "roles", attributes: ["name"] }],
    });
    if (!user) return res.status(404).json({ error: "Employee not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch employee" });
  }
};

const updateActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await Employee.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Ép kiểu boolean
    user.isActive = isActive === true || isActive === "true";

    await user.save();

    res.json({ message: "User status updated", isActive: user.isActive });
  } catch (err) {
    console.error("Update active status error:", err);
    res
      .status(500)
      .json({ error: "Failed to update user status", details: err.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, ...updateData } = req.body;

    // Tìm nhân viên hiện tại
    const existingUser = await Employee.findOne({
      where: { id },
      include: [{ model: Role, as: "roles", attributes: ["name"] }],
    });

    if (!existingUser) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // ==== VALIDATE TRÙNG LẶP ====
    const existingIdentityNumber = await Employee.findOne({
      where: {
        identityNumber: updateData.identityNumber,
      },
    });

    const existingMail = await Employee.findOne({
      where: {
        email: updateData.email,
      },
    });

    const existingPhone = await Employee.findOne({
      where: {
        phoneNumber: updateData.phoneNumber,
      },
    });

    if (
      (existingIdentityNumber && existingIdentityNumber.id !== parseInt(id)) ||
      (existingMail && existingMail.id !== parseInt(id)) ||
      (existingPhone && existingPhone.id !== parseInt(id))
    ) {
      if (existingIdentityNumber && existingIdentityNumber.id !== parseInt(id))
        return res
          .status(409)
          .json({ error: "Identity number already exists" });
      if (existingMail && existingMail.id !== parseInt(id))
        return res.status(409).json({ error: "Email already exists" });
      if (existingPhone && existingPhone.id !== parseInt(id))
        return res.status(409).json({ error: "Phone number already exists" });
    }

    // ==== VALIDATE BẮT BUỘC ====
    if (!updateData.name || !updateData.email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    // ==== Xử lý avatar ====
    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    // ==== Xử lý password ====
    if (!updateData.password || updateData.password.trim() === "") {
      delete updateData.password;
    } else {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // ==== Cập nhật thông tin cơ bản ====
    await Employee.update(updateData, { where: { id } });

    // ==== Kiểm tra role thay đổi ====
    const oldRole = existingUser.Roles?.[0]?.name;
    const newRole = role;

    if (newRole && newRole !== oldRole) {
      await EmployeeRole.destroy({ where: { employeeId: id } });
      const roleRecord = await Role.findOne({ where: { name: newRole }, include: [{ model: Role, as: "roles", attributes: ["name"] }] });
      if (!roleRecord) {
        return res.status(404).json({ error: `Role '${newRole}' not found` });
      }
      await EmployeeRole.create({
        employeeId: id,
        roleId: roleRecord.id,
      });

      // if (oldRole === "doctor" && newRole !== "doctor") {
      //   await Doctor.destroy({ where: { employeeId: id } });
      // }
      // if (newRole === "doctor" && oldRole !== "doctor") {
      //   await Doctor.create({
      //     employeeId: id,
      //     speciality: "",
      //     workingHours: "",
      //   });
      // }
    }

    // ==== Lấy lại dữ liệu đã cập nhật ====
    const updatedUser = await Employee.findByPk(id, {
      include: [{ model: Role, as: "roles", attributes: ["name"] }],
      attributes: { exclude: ["password"] },
    });

    res.json({
      message: "Employee updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update employee error:", err);
    res.status(500).json({
      error: "Failed to update employee",
      details: err.message,
    });
  }
};

module.exports = {
  createRole,
  getRoles,
  updateRole,
  deleteRole,
  createEmployee,
  getEmployees,
  deleteEmployee,
  getEmployeeById,
  updateActiveStatus,
  updateEmployee,
};
