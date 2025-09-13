const { Staff } = require("../models");
const { User } = require("../models");
const {
  sendVerifyEmail,
  sendForgotPasswordEmail,
  sendStaffVerifyEmail,
} = require("../service/sendVerifyEmail");
const jwt = require("jsonwebtoken");

function generateToken(id) {
  return jwt.sign({ id: id }, process.env.JWT_SECRET || "your_jwt_secret", {
    expiresIn: "2h"
  });
}

const register = async (req, res) => {
  try {
    const { name, email, password, identityNumber, phoneNumber, speciality, dateOfBirth, gender, address } = req.body;
    const existUser = await User.findOne({ where: { identityNumber } });
    if (existUser) {
      const updateUser = await User.update({ name, email, password, identityNumber, phoneNumber, role: "staff", dateOfBirth, gender, address, isActive: true }, { where: { identityNumber } });
      const staff = await Staff.create({ speciality, userId: updateUser.id });
      sendStaffVerifyEmail(email, password);
      return res.status(200).json({ user: updateUser, staff, token: generateToken(updateUser.id) });
    }
    const user = await User.create({ name, email, password, identityNumber, phoneNumber, role: "staff", dateOfBirth, gender, address, isActive: true });
    const staff = await Staff.create({ speciality, userId: user.id });
    sendStaffVerifyEmail(email, password);
    res.status(201).json({ user, staff, token: generateToken(user.id) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to register staff" });
  }
};

const getStaff = async (req, res) => {
  try {
    const staff = await Staff.findAll();
    res.status(200).json(staff);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get staff" });
  }
};

const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    res.status(200).json(staff);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get staff" });
  }
};

const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.update(req.body, { where: { id: req.params.id } });
    res.status(200).json(staff);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update staff" });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.destroy({ where: { id: req.params.id } });
    res.status(200).json(staff);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete staff" });
  }
};

module.exports = { register, getStaff, getStaffById, updateStaff, deleteStaff };