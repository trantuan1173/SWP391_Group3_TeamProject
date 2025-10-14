const { Patient, Appointment, MedicalRecord, Employee, Room, Service } = require("../models");
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

    console.log(`[patientLogin] attempt for email: ${email}`);

    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const patient = await Patient.findOne({ where: { email } });
    if (!patient) {
      console.log(`[patientLogin] user not found for email: ${email}`);
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, patient.password);
    console.log(`[patientLogin] password match for ${email}: ${isMatch}`);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = generateToken(patient.id, "patient");
    // Return token and patient info (without password) so frontend can set user state
    const patientJson = patient.toJSON ? patient.toJSON() : { ...patient };
    if (patientJson.password) delete patientJson.password;
    res.json({ message: "Login successful", token, patient: patientJson });
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
    console.log(`[register] attempt: email=${email} identityNumber=${identityNumber} phone=${phoneNumber}`);
    const existing = await Patient.findOne({ where: { email } });
    if (existing) {
      console.log(`[register] conflict: email exists -> ${email}`);
      return res.status(409).json({ error: "Email already exists" });
    }

    if (phoneNumber) {
      const existingPhone = await Patient.findOne({ where: { phoneNumber } });
      if (existingPhone) {
        console.log(`[register] conflict: phone exists -> ${phoneNumber}`);
        return res.status(409).json({ error: "Phone number already exists" });
      }
    }

    if (identityNumber) {
      const existingIdentity = await Patient.findOne({ where: { identityNumber } });
      if (existingIdentity) {
        console.log(`[register] conflict: identity exists -> ${identityNumber}`);
        return res.status(409).json({ error: "Identity number already exists" });
      }
    }

    const newPatient = await Patient.create({
      name,
      email,
      password: password,
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
    console.log('[createAppointment] payload:', req.body);
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
          model: Employee,
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

    console.log(`[getPatientById] request for id=${id}`);
    // If the route is protected, req.user and req.userType may be set by middleware
    if (req.userType === 'patient') {
      // Patients can only access their own profile
      if (!req.user || parseInt(req.user.id) !== parseInt(id)) {
        return res.status(403).json({ error: "Forbidden: cannot access other patient's data" });
      }
    }

    let patient = null;
    try {
      patient = await Patient.findOne({
        where: { id },
        include: [
          {
            model: Appointment,
            include: [
              // doctor stored on Appointment as foreign key to Employee
              { model: Employee, attributes: ["name", "email", "phoneNumber"] },
              { model: Room, attributes: ["name", "type"] },
            ],
          },
          {
            model: MedicalRecord,
            include: [
              { model: Employee, attributes: ["name", "email", "phoneNumber", "avatar"] },
              { model: Room, attributes: ["name", "type"] },
              { model: Appointment, attributes: ["date", "startTime", "endTime"] },
              { model: Service, through: { attributes: ["quantity", "total"] } },
            ],
          },
        ],
      });
    } catch (includeError) {
      console.error("[getPatientById] include query failed, falling back to basic fetch. Error:", includeError && includeError.stack ? includeError.stack : includeError);
      // Try a simpler lookup to avoid returning 500 to the client
      patient = await Patient.findByPk(id);
    }

    if (!patient)
      return res.status(404).json({ error: "Patient not found" });

    // If we have full relations, use them; otherwise return a basic profile with empty arrays
    const hasRelations = !!patient.MedicalRecords || !!patient.Appointments;

    res.json({
      id: patient.id,
      name: patient.name,
      email: patient.email,
      phoneNumber: patient.phoneNumber,
      address: patient.address || null,
      dateOfBirth: patient.dateOfBirth || null,
      gender: patient.gender || null,
      prescriptions: hasRelations ? (patient.MedicalRecords || []) : [],
      checkups: hasRelations ? (patient.Appointments || []) : [],
      documents: hasRelations ? (patient.MedicalRecords || []) : [],
      payments: [],
    });
  } catch (error) {
    console.error("[getPatientById] error:", error && error.stack ? error.stack : error);
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
  // Update patient profile (only patient themself or admin via other routes)
  updatePatient: async (req, res) => {
    try {
      const { id } = req.params;
      // Only patient owners can update their profile
      if (req.userType === 'patient') {
        if (!req.user || parseInt(req.user.id) !== parseInt(id)) {
          return res.status(403).json({ error: 'Forbidden: cannot update other patient' });
        }
      }

  const allowed = ['name', 'email', 'phoneNumber', 'address', 'dateOfBirth'];
      const payload = {};
      for (const k of allowed) if (k in req.body) payload[k] = req.body[k];

      const patient = await Patient.findByPk(id);
      if (!patient) return res.status(404).json({ error: 'Patient not found' });

      await patient.update(payload);
      const p = patient.toJSON();
      if (p.password) delete p.password;
      res.json({ message: 'Profile updated', patient: p });
    } catch (error) {
      console.error('[updatePatient] error:', error);
      res.status(500).json({ error: 'Failed to update patient' });
    }
  }
};
