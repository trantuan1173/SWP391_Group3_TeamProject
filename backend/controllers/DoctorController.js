const { Doctor, Appointment, DoctorSchedule } = require("../models");
const { Op } = require("sequelize");
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
      const updateUser = await User.update({ name, email, password, identityNumber, phoneNumber, role: "doctor", dateOfBirth, gender, address, isActive: true }, { where: { identityNumber } });
      const doctor = await Doctor.create({ speciality, userId: updateUser.id });
      sendStaffVerifyEmail(email, password);
      return res.status(200).json({ user: updateUser, doctor, token: generateToken(updateUser.id) });
    }
    const user = await User.create({ name, email, password, identityNumber, phoneNumber, role: "doctor", dateOfBirth, gender, address, isActive: true });
    const doctor = await Doctor.create({ speciality, userId: user.id });
    sendStaffVerifyEmail(email, password);
    res.status(201).json({ user, doctor, token: generateToken(user.id) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to register doctor" });
  }
};


const getDoctor = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "name", "email", "phoneNumber", "avatar"],
        },
      ],
    });

    res.status(200).json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get doctor" });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    res.status(200).json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get doctor" });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.update(req.body, { where: { id: req.params.id } });
    res.status(200).json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update doctor" });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.destroy({ where: { id: req.params.id } });
    res.status(200).json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete doctor" });
  }
};

const getDoctorAvailable = async (req, res) => {
  try {
    const { speciality, date, startTime, endTime } = req.body;

    const doctors = await Doctor.findAll({where: { isAvailable: true, speciality }});
    const doctorIds = doctors.map(d => d.id);

    if (doctorIds.length === 0) {
      return res.status(200).json([]);
    }

    const validSchedules = await DoctorSchedule.findAll({
      where: {
        doctorId: { [Op.in]: doctorIds },
        date,
        startTime: { [Op.lte]: startTime },
        endTime:   { [Op.gte]: endTime }
      }
    });
    const validDoctorIds = validSchedules.map(s => s.doctorId);

    const busyAppointments = await Appointment.findAll({
      where: {
        doctorId: { [Op.in]: validDoctorIds },
        date,
        status: "confirmed",
        [Op.and]: [
          { startTime: { [Op.lt]: endTime } },
          { endTime:   { [Op.gt]: startTime } }
        ]
      }
    });
    const busyDoctorIds = new Set(busyAppointments.map(a => a.doctorId));

    const availableDoctors = doctors.filter(d => validDoctorIds.includes(d.id) && !busyDoctorIds.has(d.id));

    res.status(200).json(availableDoctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get doctor" });
  }
};

module.exports = { register, getDoctor, getDoctorById, updateDoctor, deleteDoctor, getDoctorAvailable };