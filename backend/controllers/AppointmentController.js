const { Appointment, Room, Employee, Patient } = require("../models");
const {
  sendVerifyEmail,
  sendForgotPasswordEmail,
  sendStaffVerifyEmail,
} = require("../service/sendVerifyEmail");
const { Op, sequelize } = require("sequelize");
//Get all appointment
const getAppointment = async (req, res) => {
  try {
    const staff = await Appointment.findAll({
        include: [
            {
                model: Patient,
            },
            {
                model: Employee,
            },
            { model: Room, attributes: ["name", "type"] },
        ],
    });
    res.status(200).json(staff);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get staff" });
  }
};

//Get appointment by id
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        { model: Employee, attributes: ["id", "name", "email", "phoneNumber", "avatar"] },
        { model: Room, attributes: ["id", "name", "type"] },
      ],
    });
    res.status(200).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get appointment" });
  }
};

//Get all appointmenr today
const getAppointmentToday = async (req, res) => {
  try {
    // Lấy toàn bộ appointments
    const appointments = await Appointment.findAll();

    // Lấy ngày hiện tại (theo giờ VN)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Lọc: chỉ lấy các appointment có ngày >= hôm nay
    const filtered = appointments.filter(a => {
      const apptDate = new Date(a.date);
      apptDate.setHours(0, 0, 0, 0);
      return apptDate >= today;
    });

    res.status(200).json(filtered);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get appointments" });
  }
};

//Update appointment
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    await appointment.update(req.body);
    res.status(200).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update staff" });
  }
};

//Delete appointment
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.destroy({ where: { id: req.params.id } });
    res.status(200).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete staff" });
  }
};

//Get appointment by patient id
const getAppointmentByPatientId = async (req, res) => {
  try {
    const appointment = await Appointment.findAll({
      where: { patientId: req.params.id },
      include: [
        // doctor is stored as employee via doctorId foreign key
        { model: Employee, attributes: ["name", "email", "phoneNumber", "avatar"] },
        { model: Room, attributes: ["name", "type"] },
      ],
    });

    res.status(200).json(appointment);
  } catch (error) {
    console.error('[getAppointmentByPatientId] error:', error && error.stack ? error.stack : error);
    // Temporary fallback: return empty array so frontend remains usable while DB connectivity is fixed
    res.status(200).json([]);
  }
};

//Get appointment by doctor id
const getAppointmentByDoctorId = async (req, res) => {
  try {
    const appointment = await Appointment.findAll({
      where: { doctorId: req.params.id },
      include: [
        { model: Employee, attributes: ["id", "name", "email", "phoneNumber", "avatar"] },
        { model: Room, attributes: ["id", "name", "type"] },
      ],
    });
    res.status(200).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get appointment" });
  }
};

//Get appointment by status
const getAppointmentByStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findAll({ where: { status: req.params.status } });
    res.status(200).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get appointment" });
  }
};

module.exports = { getAppointment, getAppointmentById, updateAppointment, deleteAppointment, getAppointmentByPatientId, getAppointmentByDoctorId, getAppointmentByStatus, getAppointmentToday };