const { Appointment, Doctor, Room, Employee } = require("../models");
const {
  sendVerifyEmail,
  sendForgotPasswordEmail,
  sendStaffVerifyEmail,
} = require("../service/sendVerifyEmail");

//Get all appointment
const getAppointment = async (req, res) => {
  try {
    const staff = await Appointment.findAll();
    res.status(200).json(staff);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get staff" });
  }
};

//Get appointment by id
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    res.status(200).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get appointment" });
  }
};

//Update appointment
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.update(req.body, { where: { id: req.params.id } });
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
        {
          model: Doctor,
          include: [{ model: Employee, attributes: ["name", "email", "phoneNumber", "avatar"] }],
        },
        { model: Room, attributes: ["name", "type"] },
      ],
    });

    res.status(200).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get appointment" });
  }
};

//Get appointment by doctor id
const getAppointmentByDoctorId = async (req, res) => {
  try {
    const appointment = await Appointment.findAll({ where: { doctorId: req.params.id } });
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

module.exports = { getAppointment, getAppointmentById, updateAppointment, deleteAppointment, getAppointmentByPatientId, getAppointmentByDoctorId, getAppointmentByStatus };