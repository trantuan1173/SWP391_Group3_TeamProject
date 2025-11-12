const Employee = require("../models/Employee");
const Patient = require("../models/Patient");
const { Staff } = require("../models");
const { Op } = require("sequelize");
const Role = require("../models/Role");
const EmployeeRole = require("../models/EmployeeRole");
const { sendStaffVerifyEmail } = require("../service/sendVerifyEmail");
const bcrypt = require("bcrypt");

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

const createEmployee = async (req, res) => {
  try {
    let { roles, ...userData } = req.body;

    if (typeof roles === "string") {
      roles = roles.split(",").map((r) => r.trim());
    }

    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ error: "Ít nhất một role phải được chọn" });
    }

    if (!userData.name || !userData.email || !userData.password) {
      return res
        .status(400)
        .json({ error: "Tên, email và mật khẩu là bắt buộc" });
    }

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

    if (req.file) {
      userData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    const employee = await Employee.create({ ...userData });

    const employeeRoles = [];
    for (const roleName of roles) {
      const roleRecord = await Role.findOne({ where: { name: roleName } });
      if (!roleRecord) {
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

    await sendStaffVerifyEmail(employee.email, userData.password);

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

const getEmployees = async (req, res) => {
  try {
    console.log(req.query);

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const search = req.query.search ? req.query.search.trim() : "";
    const role = req.query.role ? req.query.role.trim() : "";
    const offset = (page - 1) * pageSize;

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

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    await EmployeeRole.destroy({ where: { employeeId: id } });

    const deleted = await Employee.destroy({ where: { id } });
    if (!deleted)
      return res.status(404).json({ error: "Không tìm thấy nhân viên" });

    res.json({ message: "Nhân viên xoá thành công" });
  } catch (err) {
    res.status(500).json({ error: "Nhân viên xoá thất bại" });
  }
};

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

    if (typeof roles === "string") {
      roles = roles.split(",").map((r) => r.trim());
    }

    const existingUser = await Employee.findOne({
      where: { id },
      include: [{ model: Role, as: "roles" }],
    });

    if (!existingUser) {
      return res.status(404).json({ error: "Nhân viên không tìm thấy" });
    }

    if (!updateData.name || !updateData.email) {
      return res.status(400).json({ error: "Tên và email là bắt buộc" });
    }

    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    if (!updateData.password || updateData.password.trim() === "") {
      delete updateData.password;
    } else {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await Employee.update(updateData, { where: { id } });

    if (roles && Array.isArray(roles) && roles.length > 0) {
      await EmployeeRole.destroy({ where: { employeeId: id } });

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

      const hasDoctor = roles.some((r) => r.toLowerCase() === "doctor");
      if (hasDoctor && speciality !== undefined) {
        await Employee.update({ speciality }, { where: { id } });
      } else if (!hasDoctor) {
        await Employee.update({ speciality: null }, { where: { id } });
      }
    }

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

    if (!name || !identityNumber) {
      return res.status(400).json({ error: "Tên và CCCD/CMND là bắt buộc" });
    }

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
    delete cleanPatient.password;

    res.status(201).json({
      message: "Bệnh nhân tạo thành công",
      patient: cleanPatient,
      l,
    });
  } catch (error) {
    res.status(500).json({ error: "Bệnh nhân tạo thất bại" });
  }
};

const getPatients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const search = req.query.search ? req.query.search.trim() : "";

    console.log("Search query:", search);

    const offset = (page - 1) * pageSize;

    const whereCondition = {};

    if (search) {
      const keywords = search.split(/\s+/).filter(Boolean);

      whereCondition[Op.or] = keywords.flatMap((keyword) => [
        { name: { [Op.like]: `%${keyword}%` } },
        { email: { [Op.like]: `%${keyword}%` } },
      ]);
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

    const employee = await Employee.findByPk(id, {
      include: [{ model: Role, as: "roles" }],
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const isDoctor = employee.roles?.some(
      (r) => r.name && r.name.toLowerCase() === "doctor"
    );
    if (!isDoctor) {
      return res
        .status(400)
        .json({ error: "This employee is not assigned as a doctor" });
    }

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
