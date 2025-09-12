const User = require("./User");
const Doctor = require("./Doctor");
const Patient = require("./Patient");
const Admin = require("./Admin");
const Appointment = require("./Appointment");
const MedicalRecord = require("./MedicalRecord");

User.hasOne(Doctor, { foreignKey: "userId" });
User.hasOne(Patient, { foreignKey: "userId" });
User.hasOne(Admin, { foreignKey: "userId" });
User.hasMany(Appointment, { foreignKey: "createBy" });
User.hasMany(MedicalRecord, { foreignKey: "createBy" });

Doctor.hasMany(Appointment, { foreignKey: "doctorId" });
Doctor.hasMany(MedicalRecord, { foreignKey: "doctorId" });

Patient.hasMany(Appointment, { foreignKey: "patientId" });
Patient.hasMany(MedicalRecord, { foreignKey: "patientId" });

module.exports = {
  User,
  Doctor,
  Patient,
  Admin,
  Appointment,
  MedicalRecord,
};