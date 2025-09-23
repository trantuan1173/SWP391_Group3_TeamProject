const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Admin = require("../models/Admin");
const { Staff } = require("../models");
const { Op } = require("sequelize");

const createUser = async (req, res) => {
  try {
    const { role, ...userData } = req.body;

    if (req.file) {
      userData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    if (!userData.name || !userData.email || !userData.password) {
      return res
        .status(400)
        .json({ error: "Name, email and password are required" });
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
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
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
      include: [Doctor, Patient, Staff], // bỏ Admin nếu không cần
      where: {
        role: {
          [Op.ne]: "admin", // not equal admin
        },
      },
    });

    res.json(users);
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
    const updateData = { ...req.body };

    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }
    if (!updateData.password || updateData.password.trim() === "") {
      delete updateData.password;
    } else {
      const bcrypt = require("bcrypt");
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const [updated] = await User.update(updateData, {
      where: { id },
    });

    if (!updated) {
      return res.status(400).json({ error: "Failed to update user" });
    }

    // Lấy user đã update (không trả về password)
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({
      error: "Failed to update user",
      details: err.message,
    });
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
