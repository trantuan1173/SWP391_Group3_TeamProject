const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Admin = require("../models/Admin");
const { Staff } = require("../models");
const { Op } = require("sequelize");

const createUser = async (req, res) => {
  try {
    const { role, ...userData } = req.body;
    const errors = [];
    if (req.file) {
      userData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    // Validate
    if (!userData.name || userData.name.trim().length < 3) {
      errors.push("Name must be at least 3 characters");
    }

    if (!userData.email) {
      errors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push("Invalid email format");
    }

    if (!userData.password || userData.password.length < 6) {
      errors.push("Password must be at least 6 characters");
    }

    if (!userData.identityNumber || userData.identityNumber.length < 9) {
      errors.push("Identity number must be at least 9 digits");
    }

    if (!userData.phoneNumber || !/^[0-9]{9,11}$/.test(userData.phoneNumber)) {
      errors.push("Phone number must be 9–11 digits");
    }

    if (!userData.address || userData.address.length < 10) {
      errors.push("Address must be at least 10 characters");
    }

    if (!role || !["doctor", "patient", "admin"].includes(role)) {
      errors.push("Role must be doctor, patient or admin");
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const identityExists = await User.findOne({
      where: { identityNumber: userData.identityNumber },
    });
    if (identityExists) {
      return res
        .status(400)
        .json({ errors: ["Identity number already exists"] });
    }

    const user = await User.create({ ...userData, role });

    if (role === "doctor") {
      await Doctor.create({
        userId: user.id,
        speciality: "",
        workingHours: "",
      });
    } else if (role === "patient") {
      await Patient.create({ userId: user.id });
    } else if (role === "admin") {
      await Admin.create({ userId: user.id });
    }

    res.status(201).json({ message: "User created", user });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        errors: error.errors.map((e) => `${e.path} already exists`),
      });
    }
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

const getUsers = async (req, res) => {
  try {
    // Lấy query params từ request
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const search = req.query.search || "";

    // Tính offset
    const offset = (page - 1) * pageSize;

    // Điều kiện where
    const whereCondition = {
      role: { [Op.ne]: "admin" }, // bỏ admin
    };

    if (search) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    // Query bằng findAndCountAll để lấy cả dữ liệu + tổng số record
    const { rows: users, count: total } = await User.findAndCountAll({
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "isActive",
        "phoneNumber",
        "avatar",
        "dateOfBirth",
        "gender",
        "address",
        "identityNumber",
      ],
      include: [Doctor, Patient],
      where: whereCondition,
      limit: pageSize,
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      users,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await Doctor.destroy({ where: { userId: id } });
    await Patient.destroy({ where: { userId: id } });
    await Admin.destroy({ where: { userId: id } });

    const deleted = await User.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [Doctor, Patient, Admin],
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

const updateActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByPk(id);
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

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const existingUser = await User.findByPk(id);

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const oldRole = existingUser.role;
    const { role, ...updateData } = req.body;
    const errors = [];

    // ===== AVATAR =====
    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    } else {
      delete updateData.avatar; // giữ avatar cũ
    }

    // ===== VALIDATE =====
    if (updateData.name && updateData.name.trim().length < 3) {
      errors.push("Name must be at least 3 characters");
    }

    if (updateData.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.email)) {
        errors.push("Invalid email format");
      } else {
        const emailExists = await User.findOne({
          where: { email: updateData.email },
        });
        if (emailExists && emailExists.id != id) {
          errors.push("Email already exists");
        }
      }
    }

    if (updateData.password && updateData.password.length < 6) {
      errors.push("Password must be at least 6 characters");
    }

    if (updateData.identityNumber) {
      if (updateData.identityNumber.length < 9) {
        errors.push("Identity number must be at least 9 digits");
      } else {
        const identityExists = await User.findOne({
          where: { identityNumber: updateData.identityNumber },
        });
        if (identityExists && identityExists.id != id) {
          errors.push("Identity number already exists");
        }
      }
    }

    // if (updateData.phoneNumber) {
    //   if (!/^[0-9]{9,11}$/.test(updateData.phoneNumber)) {
    //     errors.push("Phone number must be 9–11 digits");
    //   } else {
    //     const phoneExists = await User.findOne({
    //       where: { phoneNumber: updateData.phoneNumber },
    //     });
    //     if (phoneExists && phoneExists.id != id) {
    //       errors.push("Phone number already exists");
    //     }
    //   }
    // }

    if (updateData.address && updateData.address.length < 10) {
      errors.push("Address must be at least 10 characters");
    }

    if (role && !["doctor", "patient", "admin", "staff"].includes(role)) {
      errors.push("Role must be doctor, patient, staff or admin");
    }

    // Nếu có lỗi thì return luôn
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // ===== PASSWORD =====
    if (!updateData.password || updateData.password.trim() === "") {
      delete updateData.password;
    } else {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // ===== UPDATE USER =====
    await User.update({ ...updateData, role }, { where: { id } });

    // ===== ROLE CHANGE =====
    if (role && role !== oldRole) {
      if (oldRole === "doctor") await Doctor.destroy({ where: { userId: id } });
      if (oldRole === "patient")
        await Patient.destroy({ where: { userId: id } });
      if (oldRole === "staff") await Staff.destroy({ where: { userId: id } });
      if (oldRole === "admin") await Admin.destroy({ where: { userId: id } });

      if (role === "doctor")
        await Doctor.create({ userId: id, speciality: "", workingHours: "" });
      if (role === "patient") await Patient.create({ userId: id });
      if (role === "staff") await Staff.create({ userId: id });
      if (role === "admin") await Admin.create({ userId: id });
    }

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        errors: error.errors.map((e) => `${e.path} already exists`),
      });
    }
    console.error("Update user error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

module.exports = {
  updateActiveStatus,
  createUser,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
};
