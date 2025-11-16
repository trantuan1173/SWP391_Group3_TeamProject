const { Patient, Appointment, MedicalRecord, Employee, Room, Service } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {sendVerifyEmail, sendForgotPasswordEmail} = require("../service/sendVerifyEmail");

function generateToken(id, type) {
  return jwt.sign({ id, type }, process.env.JWT_SECRET || "your_jwt_secret", {
    expiresIn: "2h",
  });
}

const getAllPatients = async (req, res) => {
  const patients = await Patient.findAll();
  res.json({ data: patients });
};

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
    const patientJson = patient.toJSON ? patient.toJSON() : { ...patient };
    if (patientJson.password) delete patientJson.password;
    res.json({ message: "Login successful", token, patient: patientJson });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to login" });
  }
};

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      identityNumber,
      phoneNumber,
    } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "Missing required fields" });

    console.log(`[register] attempt: email=${email} identityNumber=${identityNumber} phone=${phoneNumber}`);
    const existing = await Patient.findOne({ where: { email } });
    if (existing) {
      console.log(`[register] conflict: email exists -> ${email}`);
      return res.status(409).json({ error: "Email đã tồn tại" });
    }

    if (phoneNumber) {
      const existingPhone = await Patient.findOne({ where: { phoneNumber } });
      if (existingPhone) {
        console.log(`[register] conflict: phone exists -> ${phoneNumber}`);
        return res.status(409).json({ error: "Số điện thoại đã tồn tại" });
      }
    }

    if (identityNumber) {
      const existingIdentity = await Patient.findOne({ where: { identityNumber } });
      if (existingIdentity) {
        console.log(`[register] conflict: identity exists -> ${identityNumber}`);
        return res.status(409).json({ error: "Số căn cước công dân đã tồn tại" });
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;


    const newPatient = await Patient.create({
      name,
      email,
      password: password,
      identityNumber: identityNumber || null,
      phoneNumber: phoneNumber || null,
      otp: otp,
      otpExpires: otpExpires,
    });
    
    sendVerifyEmail(email, otp);

    res.status(201).json({
      message: "Patient registered successfully",
      patient: newPatient,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to register patient" });
  }
};

const createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, roomId, date, startTime, endTime, status } = req.body;
    console.log('[createAppointment] payload:', req.body);

    const patient = await Patient.findByPk(patientId);
    if (!patient)
      return res.status(404).json({ error: "Patient not found" });

    let createById = req.userId;
    let createByType = req.userType || "employee";

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      roomId: roomId === '' ? null : roomId,
      date,
      startTime,
      endTime,
      status: status || "pending",
      createById,
      createByType: createByType || "employee",
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

const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`[getPatientById] request for id=${id}`);
    if (req.userType === 'patient') {
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
      patient = await Patient.findByPk(id);
    }

    if (!patient)
      return res.status(404).json({ error: "Patient not found" });
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

const verifyPatient = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const patient = await Patient.findOne({ where: { email } });

    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    if (patient.isActive) {
      return res
        .status(400)
        .json({ success: false, message: "Patient already verified" });
    }

    if (!patient.otp || patient.otp !== otp || patient.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "OTP không hợp lệ hoặc đã hết hạn" });
    }

    patient.isActive = true;
    patient.otp = undefined;
    patient.otpExpires = undefined;
    await patient.save();

    res.status(200).json({ success: true, message: "Xác minh thành công" });
  } catch (error) {
    console.error("Verify error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const resendVerifyEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const patient = await Patient.findOne({ where: { email } });

    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    if (patient.isActive) {
      return res
        .status(400)
        .json({ success: false, message: "Patient already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpires = Date.now() + 60 * 60 * 1000;

    patient.otp = otp;
    patient.otpExpires = otpExpires;
    await patient.save();

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Resend verify error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { identityNumber } = req.body;
    const patient = await Patient.findOne({ where: { identityNumber } });

    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpires = Date.now() + 60 * 60 * 1000;

    patient.otp = otp;
    patient.otpExpires = otpExpires;
    await patient.save();

    sendForgotPasswordEmail(patient.email, otp);

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { identityNumber, otp, password } = req.body;
    const patient = await Patient.findOne({ where: { identityNumber } });

    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    if (!patient.otp || patient.otp !== otp || patient.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "OTP không hợp lệ hoặc đã hết hạn" });
    }

    patient.password = password;
    patient.otp = undefined;
    patient.otpExpires = undefined;
    await patient.save();

    res.status(200).json({ success: true, message: "Mật khẩu đã được thay đổi" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const patchPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    console.log(patientId);
    const patient = await Patient.findByPk(patientId);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    const allowed = ['dateOfBirth', 'gender'];
    const payload = {};
    for (const k of allowed) if (k in req.body) payload[k] = req.body[k];
    await patient.update(payload);
    const p = patient.toJSON ? patient.toJSON() : { ...patient };
    if (p.password) delete p.password;
    res.json({ message: 'Profile updated', patient: p });
  } catch (error) {
    console.error('[patchPatient] error:', error && error.stack ? error.stack : error);
    res.status(500).json({ error: 'Failed to update patient' });
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
  updatePatient,
  verifyPatient,
  resendVerifyEmail,
  forgotPassword,
  resetPassword,
  getAllPatients,
  patchPatient,
};

async function updatePatient(req, res) {
  try {
    const { id } = req.params;

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
    const p = patient.toJSON ? patient.toJSON() : { ...patient };
    if (p.password) delete p.password;
    res.json({ message: 'Profile updated', patient: p });
  } catch (error) {
    console.error('[updatePatient] error:', error && error.stack ? error.stack : error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
}
