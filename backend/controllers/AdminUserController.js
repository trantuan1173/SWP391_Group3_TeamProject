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
      return res.status(400).json({ error: "Vai trò đã tồn tại" });
    }
    if (!name) {
      return res.status(400).json({ error: "Bạn cần nhập tên vai trò" });
    }
    const role = await Role.create({ name });
    res.status(201).json({ message: "Vai trò tạo thành công", role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Vai trò không thể tạo" });
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
      message: "Vai trò lấy thành công",
      roles,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: "Vai trò lấy thất bại" });
  }
};

//Update role
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: "Không tìm thấy vai trò" });
    }
    role.name = name;
    await role.save();
    res.json({ message: "Vai trò cập nhật thành công", role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Vai trò cập nhật thất bại" });
  }
};

//Delete role
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: "Vai trò không tìm thấy" });
    }
    await role.destroy();
    res.json({ message: "Vai trò đã xoá" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Vai trò xoá thất bại" });
  }
};

const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: "Vai trò không tìm thấy" });
    }
    res.json(role);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Vai trò lấy thất bại" });
  }
};
//Create employee
const createEmployee = async (req, res) => {
  try {
    let { roles, ...userData } = req.body;

    // Parse roles nếu là string (từ FormData)
    if (typeof roles === "string") {
      roles = roles.split(",").map((r) => r.trim());
    }

    // Validate roles
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ error: "Ít nhất một role phải được chọn" });
    }

    // Validate required fields
    if (!userData.name || !userData.email || !userData.password) {
      return res
        .status(400)
        .json({ error: "Tên, email và mật khẩu là bắt buộc" });
    }

    // Check duplicates
    const existingIdentityNumber = await Employee.findOne({
      where: { identityNumber: userData.identityNumber },
    });
    const existingMail = await Employee.findOne({
      where: { email: userData.email },
    });
    const existingPhone = await Employee.findOne({
      where: { phoneNumber: userData.phoneNumber },
    });

    if (existingIdentityNumber) {
      return res.status(409).json({ error: "CMND/CCCD đã tồn tại" });
    }
    if (existingMail) {
      return res.status(409).json({ error: "Email đã tồn tại" });
    }
    if (existingPhone) {
      return res.status(409).json({ error: "SĐT đã tồn tại" });
    }

    // Handle avatar upload
    if (req.file) {
      userData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    // Create employee
    const employee = await Employee.create({ ...userData });

    // Assign roles
    const employeeRoles = [];
    for (const roleName of roles) {
      const roleRecord = await Role.findOne({ where: { name: roleName } });
      if (!roleRecord) {
        // Rollback: delete employee if role not found
        await employee.destroy();
        return res
          .status(404)
          .json({ error: `Vai trò '${roleName}' Không tìm thấy` });
      }

      await EmployeeRole.create({
        employeeId: employee.id,
        roleId: roleRecord.id,
      });

      employeeRoles.push({
        id: roleRecord.id,
        name: roleRecord.name,
      });
    }

    // Send verification email
    await sendStaffVerifyEmail(employee.email, userData.password);

    // Prepare response
    const cleanEmployee = employee.get({ plain: true });

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
      speciality: cleanEmployee.speciality,
      roles: employeeRoles,
      createdAt: cleanEmployee.createdAt,
      updatedAt: cleanEmployee.updatedAt,
    };

    res.status(201).json({
      message: "Nhân viên tạo thành công",
      employee: responseData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Nhân viên tạo thất bại" });
  }
};

//Get all employees with role
const getEmployees = async (req, res) => {
  try {
    // Lấy query params
    const page = parseInt(req.query.page) || 1; // trang hiện tại
    const pageSize = parseInt(req.query.pageSize) || 10; // số record mỗi trang
    const search = req.query.search ? req.query.search.trim() : ""; // từ khóa tìm kiếm
    const role = req.query.role ? req.query.role.trim() : "";
    const offset = (page - 1) * pageSize;

    // Điều kiện where cho search
    const whereCondition = {};
    const roleCondition = role
      ? { name: { [Op.like]: `%${role}%` } }
      : undefined;
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
        "speciality",
      ],
      include: [
        {
          model: Role,
          as: "roles",
          where: roleCondition,
          through: { attributes: [] },
          required: !!roleCondition,
        },
      ],
      where: whereCondition,
      limit: pageSize,
      offset,
      order: [["createdAt", "DESC"]],
      subQuery: false,
    });

    res.json({
      message: "Lấy danh sách nhân viên",
      employees,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ error: "Lấy nhân viên thất bại" });
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
    if (!deleted)
      return res.status(404).json({ error: "Không tìm thấy nhân viên" });

    res.json({ message: "Nhân viên xoá thành công" });
  } catch (err) {
    res.status(500).json({ error: "Nhân viên xoá thất bại" });
  }
};

//Const Get Employee By Id
const getEmployeeById = async (req, res) => {
  try {
    const user = await Employee.findByPk(req.params.id, {
      include: [{ model: Role, as: "roles" }],
    });
    if (!user)
      return res.status(404).json({ error: "Không tìm thấy nhân viên" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Nhân viên lấy thất bại" });
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
    let { roles, speciality, ...updateData } = req.body;

    // Parse roles nếu là string (từ FormData)
    if (typeof roles === "string") {
      roles = roles.split(",").map((r) => r.trim());
    }

    // Lấy thông tin nhân viên hiện tại
    const existingUser = await Employee.findOne({
      where: { id },
      include: [{ model: Role, as: "roles" }],
    });

    if (!existingUser) {
      return res.status(404).json({ error: "Nhân viên không tìm thấy" });
    }

    // ==== VALIDATE BẮT BUỘC ====
    if (!updateData.name || !updateData.email) {
      return res.status(400).json({ error: "Tên và email là bắt buộc" });
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

    // ==== Cập nhật roles nếu có ====
    if (roles && Array.isArray(roles) && roles.length > 0) {
      // Xóa tất cả roles cũ
      await EmployeeRole.destroy({ where: { employeeId: id } });

      // Thêm roles mới
      for (const roleName of roles) {
        const roleRecord = await Role.findOne({ where: { name: roleName } });
        if (!roleRecord) {
          return res
            .status(404)
            .json({ error: `Vai trò'${roleName}' Không tìm thấy` });
        }

        await EmployeeRole.create({
          employeeId: id,
          roleId: roleRecord.id,
        });
      }

      // Cập nhật speciality nếu có role Doctor
      const hasDoctor = roles.some((r) => r.toLowerCase() === "doctor");
      if (hasDoctor && speciality !== undefined) {
        await Employee.update({ speciality }, { where: { id } });
      } else if (!hasDoctor) {
        // Xóa speciality nếu không còn là Doctor
        await Employee.update({ speciality: null }, { where: { id } });
      }
    }

    // ==== Lấy lại dữ liệu sau khi cập nhật ====
    const updatedUser = await Employee.findByPk(id, {
      include: [{ model: Role, as: "roles" }],
      attributes: { exclude: ["password"] },
    });

    res.json({
      message: "Nhân viên cập nhật thành công",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      error: "Nhân viên cập nhật thất bại",
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
      return res.status(400).json({ error: "Tên và CCCD/CMND là bắt buộc" });
    }

    // Check for duplicates
    const existingIdentity = await Patient.findOne({
      where: { identityNumber },
    });
    if (existingIdentity) {
      return res.status(409).json({ error: "CMND/CCCD đã tồn tại" });
    }

    const existingEmail = email
      ? await Patient.findOne({ where: { email } })
      : null;
    if (existingEmail) {
      return res.status(409).json({ error: "Email đã tồn tại" });
    }

    const existingPhone = phoneNumber
      ? await Patient.findOne({ where: { phoneNumber } })
      : null;
    if (existingPhone) {
      return res.status(409).json({ error: "SĐT đã tồn tại" });
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
      message: "Bệnh nhân tạo thành công",
      patient: cleanPatient,
    });
  } catch (error) {
    res.status(500).json({ error: "Bệnh nhân tạo thất bại" });
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
    if (!patient)
      return res.status(404).json({ error: "Bệnh nhân không tìm thấy" });

    // kiểm tra trùng email, sđt, CCCD (trừ chính nó)
    if (identityNumber && identityNumber !== patient.identityNumber) {
      const existingIdentity = await Patient.findOne({
        where: { identityNumber },
      });
      if (existingIdentity)
        return res.status(409).json({ error: "CMND/CCCD đã tồn tại" });
    }

    if (email && email !== patient.email) {
      const existingEmail = await Patient.findOne({ where: { email } });
      if (existingEmail)
        return res.status(409).json({ error: "Email đã tồn tại" });
    }

    if (phoneNumber && phoneNumber !== patient.phoneNumber) {
      const existingPhone = await Patient.findOne({ where: { phoneNumber } });
      if (existingPhone)
        return res.status(409).json({ error: "SĐT đã tồn tại" });
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

    res.json({ message: "Bệnh nhân cập nhật thành công", patient: updated });
  } catch (error) {
    console.error("updatePatient error:", error);
    res.status(500).json({ error: "Bệnh nhân cập nhật thất bại" });
  }
};

// ===== Delete Patient =====
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findByPk(id);
    if (!patient)
      return res.status(404).json({ error: "Không tìm thấy bệnh nhân" });

    await patient.destroy();
    res.json({ message: "Bệnh nhân xoá thành công" });
  } catch (error) {
    res.status(500).json({ error: "Bệnh nhân xoá thất bại" });
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

const updateDoctorSpeciality = async (req, res) => {
  try {
    const { id } = req.params;
    const { speciality } = req.body;

    // Tìm employee theo ID
    const employee = await Employee.findByPk(id, {
      include: [{ model: Role, as: "roles" }],
    });

    // Kiểm tra tồn tại
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Kiểm tra role có phải là doctor không
    const isDoctor = employee.roles?.some(
      (r) => r.name && r.name.toLowerCase() === "doctor"
    );
    if (!isDoctor) {
      return res
        .status(400)
        .json({ error: "This employee is not assigned as a doctor" });
    }

    // Cập nhật trường speciality trực tiếp trong bảng Employees
    employee.speciality = speciality;
    await employee.save();

    res.json({
      message: "Doctor speciality updated successfully",
      employee: {
        id: employee.id,
        name: employee.name,
        role: "doctor",
        speciality: employee.speciality,
      },
    });
  } catch (error) {
    console.error("updateDoctorSpeciality error:", error);
    res.status(500).json({ error: "Failed to update doctor speciality" });
  }
};

module.exports = {
  updatePatientStatus,
  updateDoctorSpeciality,
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
