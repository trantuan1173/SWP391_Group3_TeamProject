const { Patient, Appointment, MedicalRecord, Doctor, Employee, Room, Service } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Generate JWT token
function generateToken(id, type) {
  return jwt.sign({ id, type }, process.env.JWT_SECRET || "your_jwt_secret", {
    expiresIn: "2h",
  });
}

// ✅ Patient login
const patientLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const patient = await Patient.findOne({ where: { email } });
    if (!patient)
      return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch)
      return res.status(401).json({ error: "Invalid password" });

    const token = generateToken(patient.id, "patient");
    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to login" });
  }
};

// ✅ Register patient
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      identityNumber,
      phoneNumber,
      dateOfBirth,
      gender,
      address,
    } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "Missing required fields" });

    // Check duplicates
    const existing = await Patient.findOne({
      where: { email },
    });
    if (existing) return res.status(409).json({ error: "Email already exists" });

    if (phoneNumber) {
      const existingPhone = await Patient.findOne({ where: { phoneNumber } });
      if (existingPhone) return res.status(409).json({ error: "Phone number already exists" });
    }

    if (identityNumber) {
      const existingIdentity = await Patient.findOne({ where: { identityNumber } });
      if (existingIdentity) return res.status(409).json({ error: "Identity number already exists" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newPatient = await Patient.create({
      name,
      email,
      password: hashedPassword,
      identityNumber: identityNumber || null,
      phoneNumber: phoneNumber || null,
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
      address: address || null,
    });

    res.status(201).json({
      message: "Patient registered successfully",
      patient: newPatient,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to register patient" });
  }
};

// ✅ Create appointment with login (JWT decoded)
const createAppointment = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;
    const userId = req.userId;

    const patient = await Patient.findByPk(userId);
    if (!patient)
      return res.status(404).json({ error: "Patient not found" });

    const appointment = await Appointment.create({
      patientId: patient.id,
      date,
      startTime,
      endTime,
      status: "pending",
      createById: patient.id,
      createByType: "patient",
    });

    res.status(201).json({
      message: "Appointment created successfully",
      appointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create appointment" });
  }
};

// ✅ Create appointment without login
const createAppointmentWithoutLogin = async (req, res) => {
  try {
    const { name, identityNumber, phoneNumber, date, startTime, endTime } = req.body;

    let patient = await Patient.findOne({ where: { identityNumber } });

    if (!patient) {
      patient = await Patient.create({
        name,
        identityNumber,
        phoneNumber,
      });
    }

    const appointment = await Appointment.create({
      patientId: patient.id,
      date,
      startTime,
      endTime,
      status: "pending",
      createById: patient.id,
      createByType: "patient",
    });

    res.status(201).json({
      message: "Appointment created successfully",
      patient,
      appointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create appointment" });
  }
};

// ✅ Confirm appointment
const confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorId, date, startTime, endTime } = req.body;

    const appointment = await Appointment.findByPk(id);
    if (!appointment)
      return res.status(404).json({ error: "Appointment not found" });

    await appointment.update({
      status: "confirmed",
      doctorId,
      date,
      startTime,
      endTime,
    });

    res.json({ message: "Appointment confirmed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to confirm appointment" });
  }
};

// ✅ Get prescriptions
const getPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.query;
    const where = patientId ? { patientId } : {};

    const prescriptions = await MedicalRecord.findAll({
      where,
      include: [
        {
          model: Doctor,
          include: [
            {
              model: User,
              attributes: ["name", "email", "phoneNumber", "avatar"],
            },
          ],
        },
      ],
    });

    res.json(prescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
};

// ✅ Get checkups
const getCheckups = async (req, res) => {
  try {
    const { patientId } = req.query;
    const where = patientId ? { patientId } : {};
    const checkups = await Appointment.findAll({ where });
    res.json(checkups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch checkups" });
  }
};

// ✅ Get documents
const getDocuments = async (req, res) => {
  try {
    const { patientId } = req.query;
    const where = patientId ? { patientId } : {};
    const documents = await MedicalRecord.findAll({ where });
    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
};

// ✅ Get patient by id (with appointments + records)
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findOne({
  where: { id },
  include: [
    {
      model: Appointment,
      include: [
        {
          model: Doctor,
          include: [{ model: Employee, attributes: ["name", "email", "phoneNumber"] }],
        },
        { model: Room, attributes: ["name", "type"] },
      ],
    },
    {
      model: MedicalRecord,
      include: [
        {
          model: Doctor,
          include: [{ model: Employee, attributes: ["name", "email", "phoneNumber", "avatar"] }],
        },
        { model: Room, attributes: ["name", "type"] },
        { model: Appointment, attributes: ["date", "startTime", "endTime"] },
        { model: Service, through: { attributes: ["quantity", "total"] } },
      ],
    },
  ],
});


    if (!patient)
      return res.status(404).json({ error: "Patient not found" });

    res.json({
      id: patient.id,
      name: patient.name,
      email: patient.email,
      phoneNumber: patient.phoneNumber,
      prescriptions: patient.MedicalRecords || [],
      checkups: patient.Appointments || [],
      documents: patient.MedicalRecords || [],
      payments: [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch patient" });
  }
};

module.exports = {
  patientLogin,
  register,
  createAppointment,
  createAppointmentWithoutLogin,
  confirmAppointment,
  getPrescriptions,
  getCheckups,
  getDocuments,
  getPatientById,
};
