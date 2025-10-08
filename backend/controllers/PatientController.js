const { Patient, Appointment, MedicalRecord, Doctor } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Generate JWT token
function generateToken(id, type) {
  return jwt.sign({ id: id, type: type }, process.env.JWT_SECRET || "your_jwt_secret", {
    expiresIn: "2h",
  });
}

//Patient login
const patientLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const patient = await Patient.findOne({ where: { email } });
    if (!patient) {
      return res.status(404).json({ error: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }
    const token = generateToken(patient.id, "patient");
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to login" });
  }
};

// Register patient
const register = async (req, res) => {
  try {
    const { name, email, password, identityNumber, phoneNumber, dateOfBirth, gender, address } = req.body;

    let existingEmail = await Patient.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ error: "Email already exists" });
    }
    let existingPhone = await Patient.findOne({ where: { phoneNumber } });
    if (existingPhone) {
      return res.status(409).json({ error: "Phone number already exists" });
    }
    let existingIdentityNumber = await Patient.findOne({ where: { identityNumber } });
    if (existingIdentityNumber) {
      return res.status(409).json({ error: "Identity number already exists" });
    }
    const patientUser = await Patient.create({
      name,
      email,
      password,
      identityNumber,
      phoneNumber,
      dateOfBirth,
      gender,
      address,
    });

    res.status(201).json({ patientUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to register patient" });
  }
};

// Create appointment with login -decode token
const createAppointment = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;
    const userId = req.userId;
    const patient = await Patient.findOne({ where: { userId } });
    if (!patient) {
      return res.status(400).json({ error: "Patient record not found for this user" });
    }
    const appointment = await Appointment.create({
      patientId: patient.id,
      date,
      startTime,
      endTime,
      status: "pending",
      createById: patient.id,
      createByType: "patient"
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create appointment" });
  }
};

// Create appointment without login
const createAppointmentWithoutLogin = async (req, res) => {
  try {
    const { name, identityNumber, phoneNumber, date, startTime, endTime } = req.body;
    const existingUser = await Patient.findOne({ where: { identityNumber } });
    if (existingUser) {    
      const appointment = await Appointment.create({
        patientId: existingUser.id,
        date,
        startTime,
        endTime,
        status: "pending",
        createById: existingUser.id,
        createByType: "patient"
      });
    
      return res.status(201).json({ existingUser, appointment });
    }

    const newUser = await Patient.create({
      name,
      identityNumber,
      phoneNumber,
    });

    const newAppointment = await Appointment.create({
      patientId: newUser.id,
      date,
      startTime,
      endTime,
      status: "pending",
      createById: newUser.id,
      createByType: "patient"
    });

    res.status(201).json({newUser, newAppointment});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create appointment" });
  }
};


// Confirm appointment
const confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorId, date, startTime, endTime } = req.body;
    const appointment = await Appointment.update({ status: "confirmed", doctorId, date, startTime, endTime }, { where: { id } });
    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to confirm appointment" });
  }
};

// Get prescriptions (include Doctor + User)
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
              attributes: ["name", "email", "phoneNumber", "avatar"]
            }
          ]
        }
      ]
    });
    res.json(prescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
};

// Get checkups (appointments)
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

// Get documents (medical records)
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

// Get patient by id with related info (prescriptions include Doctor + User)
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'user', // Đúng alias đã khai báo ở model
          attributes: ["id", "name", "email", "phoneNumber", "dateOfBirth", "gender", "address", "avatar"],
        },
        {
          model: Appointment,
          include: [
            {
              model: Doctor,
              include: [{ model: User, attributes: ["name", "email", "phoneNumber"] }],
            },
          ],
        },
        {
          model: MedicalRecord,
          include: [
            {
              model: Doctor,
              include: [
                {
                  model: User,
                  attributes: ["name", "email", "phoneNumber", "avatar"]
                }
              ]
            }
          ]
        },
      ],
    });

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json({
      id: patient.id,
      user: patient.user, // Trả về cả object user
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
  getPrescriptions,
  getCheckups,
  getDocuments,
  getPatientById,  
  confirmAppointment,
  createAppointmentWithoutLogin
};
