const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Admin = require("../models/Admin");
const { Staff } = require("../models");

const createUser = async (req, res) => {
  try {
    const { role, ...userData } = req.body;

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
      attributes: ["id", "name", "email", "role", "isActive", "phoneNumber"],
      include: [Doctor, Patient, Staff, Admin],
    });
    res.json(users);
  } catch (err) {
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

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await User.update(req.body, { where: { id } });
    if (!updated) return res.status(404).json({ error: "User not found" });

    const updatedUser = await User.findByPk(id);
    res.json({ message: "User updated", updatedUser });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

module.exports = {
  createUser,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
};
