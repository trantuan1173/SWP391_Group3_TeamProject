const { Doctor } = require("../models");
const { User } = require("../models");

const register = async (req, res) => {
  try {
    const { name, email, identityNumber, phoneNumber, speciality, workingHours } = req.body;
    const user = await User.create({ name, email, identityNumber, phoneNumber, role: "doctor", password: "123456" });
    const doctor = await Doctor.create({ speciality, userId: user.id, workingHours });
    res.status(201).json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to register doctor" });
  }
};

module.exports = { register };