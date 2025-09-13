const { Patient } = require("../models");
const { User } = require("../models");

const register = async (req, res) => {
  try {
    const { name, email, identityNumber, phoneNumber, dateOfBirth, gender, address } = req.body;
    const user = await User.create({ name, email, identityNumber, phoneNumber, role: "patient", password: "123456" });
    const patient = await Patient.create({ userId: user.id, dateOfBirth, gender, address });
    res.status(201).json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to register patient" });
  }
};

const createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, time } = req.body;
    const appointment = await Appointment.create({ patientId, doctorId, date, time });
    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create appointment" });
  }
};

module.exports = { register, createAppointment };