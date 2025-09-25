const { User, Patient, Appointment, MedicalRecord, Doctor } = require("../models");

// Register patient
const register = async (req, res) => {
  try {
    const { name, email, identityNumber, phoneNumber, dateOfBirth, gender, address } = req.body;

    const user = await User.create({
      name,
      email,
      identityNumber,
      phoneNumber,
      dateOfBirth,
      gender,
      address,
      role: "patient",
      password: "123456"
    });

    const patient = await Patient.create({ userId: user.id });

    res.status(201).json({ user, patient });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to register patient" });
  }
};

// Create appointment
const createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, startTime, endTime } = req.body;

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      startTime,
      endTime,
      status: "pending"
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create appointment" });
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
  register,
  createAppointment,
  getPrescriptions,
  getCheckups,
  getDocuments,
  getPatientById,  
};
