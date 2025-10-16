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
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const search = req.query.search ? req.query.search.trim() : "";

    const offset = (page - 1) * pageSize;

    const whereCondition = {};
    if (search) {
      whereCondition.name = { [Op.like]: `%${search}%` };
    }

    const { rows: roles, count: total } = await Role.findAndCountAll({
      where: whereCondition,
      limit: pageSize,
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      roles,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    });
  } catch (error) {
    console.error("getRoles error:", error);
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

const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }
    res.json(role);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch role" });
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
      include: [{ model: Role, as: "roles" }],
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
      include: [{ model: Role, as: "roles" }],
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
      include: [{ model: Role, as: "roles" }],
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
      const roleRecord = await Role.findOne({
        where: { name: newRole },
        include: [{ model: Role, as: "roles", attributes: ["name"] }],
      });
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
      include: [{ model: Role, as: "roles" }],
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

// ===== Create Patient =====
const createPatient = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      identityNumber,
      phoneNumber,
      address,
      dateOfBirth,
      gender,
    } = req.body;

    // Validate required fields
    if (!name || !identityNumber) {
      return res
        .status(400)
        .json({ error: "Name and Identity Number are required" });
    }

    // Check for duplicates
    const existingIdentity = await Patient.findOne({
      where: { identityNumber },
    });
    if (existingIdentity) {
      return res.status(409).json({ error: "Identity number already exists" });
    }

    const existingEmail = email
      ? await Patient.findOne({ where: { email } })
      : null;
    if (existingEmail) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const existingPhone = phoneNumber
      ? await Patient.findOne({ where: { phoneNumber } })
      : null;
    if (existingPhone) {
      return res.status(409).json({ error: "Phone number already exists" });
    }

    // Create patient
    const patient = await Patient.create({
      name,
      email,
      password,
      identityNumber,
      phoneNumber,
      address,
      dateOfBirth,
      gender,
      isActive: true,
    });

    const cleanPatient = patient.get({ plain: true });
    delete cleanPatient.password; // không gửi password về client

    res.status(201).json({
      message: "Patient created successfully",
      patient: cleanPatient,
    });
  } catch (error) {
    console.error("createPatient error:", error);
    res.status(500).json({ error: "Failed to create patient" });
  }
};

// ===== Get All Patients (with pagination + search) =====
const getPatients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const search = req.query.search ? req.query.search.trim() : "";

    const offset = (page - 1) * pageSize;

    const whereCondition = {};

    if (search) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phoneNumber: { [Op.like]: `%${search}%` } },
        { identityNumber: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows: patients, count: total } = await Patient.findAndCountAll({
      where: whereCondition,
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
      limit: pageSize,
      offset,
    });

    res.json({
      patients,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    });
  } catch (error) {
    console.error("getPatients error:", error);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
};

// ===== Get Patient By ID =====
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findByPk(id, {
      attributes: { exclude: ["password"] },
    });
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }
    res.json(patient);
  } catch (error) {
    console.error("getPatientById error:", error);
    res.status(500).json({ error: "Failed to fetch patient" });
  }
};

// ===== Update Patient =====
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      password,
      identityNumber,
      phoneNumber,
      address,
      dateOfBirth,
      gender,
      isActive,
    } = req.body;

    const patient = await Patient.findByPk(id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    // kiểm tra trùng email, sđt, CCCD (trừ chính nó)
    if (identityNumber && identityNumber !== patient.identityNumber) {
      const existingIdentity = await Patient.findOne({
        where: { identityNumber },
      });
      if (existingIdentity)
        return res
          .status(409)
          .json({ error: "Identity number already exists" });
    }

    if (email && email !== patient.email) {
      const existingEmail = await Patient.findOne({ where: { email } });
      if (existingEmail)
        return res.status(409).json({ error: "Email already exists" });
    }

    if (phoneNumber && phoneNumber !== patient.phoneNumber) {
      const existingPhone = await Patient.findOne({ where: { phoneNumber } });
      if (existingPhone)
        return res.status(409).json({ error: "Phone number already exists" });
    }

    if (password && password.trim() !== "") {
      patient.password = password;
    }

    Object.assign(patient, {
      name,
      email,
      identityNumber,
      phoneNumber,
      address,
      dateOfBirth,
      gender,
      isActive: isActive !== undefined ? isActive : patient.isActive,
    });

    await patient.save();
    const updated = patient.get({ plain: true });
    delete updated.password;

    res.json({ message: "Patient updated successfully", patient: updated });
  } catch (error) {
    console.error("updatePatient error:", error);
    res.status(500).json({ error: "Failed to update patient" });
  }
};

// ===== Delete Patient =====
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findByPk(id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    await patient.destroy();
    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error("deletePatient error:", error);
    res.status(500).json({ error: "Failed to delete patient" });
  }
};

const updatePatientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const patient = await Patient.findByPk(id);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    patient.isActive = isActive === true || isActive === "true";
    await patient.save();

    res.json({
      message: "Patient status updated successfully",
      isActive: patient.isActive,
    });
  } catch (err) {
    console.error("updatePatientStatus error:", err);
    res.status(500).json({ error: "Failed to update patient status" });
  }
};

const getTotalPatients = async (req, res) => {
  try {
    const total = await Patient.count();
    res.json({ total });
  } catch (error) {
    console.error("getTotalPatients error:", error);
    res.status(500).json({ error: "Failed to get total patients" });
  }
};

const getActivePatients = async (req, res) => {
  try {
    const active = await Patient.count({ where: { isActive: true } });
    res.json({ active });
  } catch (error) {
    console.error("getActivePatients error:", error);
    res.status(500).json({ error: "Failed to get active patients" });
  }
};

const getTotalEmployees = async (req, res) => {
  try {
    const total = await Employee.count();
    res.json({ total });
  } catch (error) {
    console.error("getTotalEmployees error:", error);
    res.status(500).json({ error: "Failed to get total employees" });
  }
};

const getAvailableRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({ attributes: ["id", "name"] });
    res.json({
      total: roles.length,
      roles: roles.map((r) => r.name),
    });
  } catch (error) {
    console.error("getAvailableRoles error:", error);
    res.status(500).json({ error: "Failed to get available roles" });
  }
};

const getRecentPatients = async (req, res) => {
  try {
    const patients = await Patient.findAll({
      attributes: ["id", "name", "email", "gender", "isActive"],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    res.status(200).json({ patients });
  } catch (error) {
    console.error("getRecentPatients error:", error);
    res.status(500).json({ error: "Failed to get recent patients" });
  }
};

const getRecentEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      attributes: ["id", "name", "email"],
      include: [
        {
          model: Role,
          as: "roles",
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
      order: [["id", "DESC"]],
      limit: 5,
    });

    const formatted = employees.map((emp) => ({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      role: emp.roles && emp.roles.length > 0 ? emp.roles[0].name : "Unknown",
    }));

    res.status(200).json({ employees: formatted });
  } catch (error) {
    console.error("getRecentEmployees error:", error);
    res.status(500).json({ error: "Failed to get recent employees" });
  }
};

module.exports = {
  updatePatientStatus,
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
  getRoleById,
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  getTotalPatients,
  getActivePatients,
  getTotalEmployees,
  getAvailableRoles,
  getRecentPatients,
  getRecentEmployees,
};
