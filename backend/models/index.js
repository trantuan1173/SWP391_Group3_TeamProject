const User = require("./User");
const Doctor = require("./Doctor");
const Patient = require("./Patient");
const Admin = require("./Admin");
const Appointment = require("./Appointment");
const MedicalRecord = require("./MedicalRecord");
const Receptionist = require("./Receptionists");
const DoctorSchedule = require("./DoctorSchedule");
const Room = require("./Room");

User.hasOne(Doctor, { foreignKey: "userId" });
Doctor.belongsTo(User, { foreignKey: "userId" });

User.hasOne(Patient, { foreignKey: "userId" });
Patient.belongsTo(User, { foreignKey: "userId" });

User.hasOne(Admin, { foreignKey: "userId" });
Admin.belongsTo(User, { foreignKey: "userId" });

User.hasOne(Receptionist, { foreignKey: "userId" });
Receptionist.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Appointment, { foreignKey: "createBy" });
Appointment.belongsTo(User, { foreignKey: "createBy" });
User.hasMany(MedicalRecord, { foreignKey: "createBy" });
MedicalRecord.belongsTo(User, { foreignKey: "createBy" });

Doctor.hasMany(Appointment, { foreignKey: "doctorId" });
Appointment.belongsTo(Doctor, { foreignKey: "doctorId" });
Doctor.hasMany(MedicalRecord, { foreignKey: "doctorId" });
MedicalRecord.belongsTo(Doctor, { foreignKey: "doctorId" });

Patient.hasMany(Appointment, { foreignKey: "patientId" });
Appointment.belongsTo(Patient, { foreignKey: "patientId" });
Patient.hasMany(MedicalRecord, { foreignKey: "patientId" });
MedicalRecord.belongsTo(Patient, { foreignKey: "patientId" });

Doctor.hasMany(DoctorSchedule, { foreignKey: "doctorId" });
DoctorSchedule.belongsTo(Doctor, { foreignKey: "doctorId" });

Room.hasMany(Appointment, { foreignKey: "roomId" });
Appointment.belongsTo(Room, { foreignKey: "roomId" });

Room.hasMany(MedicalRecord, { foreignKey: "roomId" });
MedicalRecord.belongsTo(Room, { foreignKey: "roomId" });

Room.hasMany(DoctorSchedule, { foreignKey: "roomId" });
DoctorSchedule.belongsTo(Room, { foreignKey: "roomId" });

module.exports = {
  User,
  Doctor,
  Patient,
  Admin,
  Receptionist,
  Appointment,
  MedicalRecord,
  DoctorSchedule,
  Room,
};