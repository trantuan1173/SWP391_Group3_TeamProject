const Doctor = require("./Doctor");
const Patient = require("./Patient");
const Appointment = require("./Appointment");
const MedicalRecord = require("./MedicalRecord");
const DoctorSchedule = require("./DoctorSchedule");
const Room = require("./Room");
const Employee = require("./Employee");
const EmployeeRole = require("./EmployeeRole");
const Role = require("./Role");
const Service = require("./Service");
const MedicalRecordService = require("./MedicalRecordService")

MedicalRecord.belongsToMany(Service, {
  through: MedicalRecordService,
  foreignKey: "medicalRecordId",
});
Service.belongsToMany(MedicalRecord, {
  through: MedicalRecordService,
  foreignKey: "serviceId",
});

EmployeeRole.belongsTo(Employee, { foreignKey: "employeeId" });
EmployeeRole.belongsTo(Role, { foreignKey: "roleId" });

Employee.hasOne(Doctor, { foreignKey: "employeeId" });
Doctor.belongsTo(Employee, { foreignKey: "employeeId" });

Employee.hasMany(MedicalRecord, { foreignKey: "createBy" });
MedicalRecord.belongsTo(Employee, { foreignKey: "createBy" });

Doctor.hasMany(Appointment, { foreignKey: "doctorId" });
Appointment.belongsTo(Doctor, { foreignKey: "doctorId" });
Doctor.hasMany(MedicalRecord, { foreignKey: "doctorId" });
MedicalRecord.belongsTo(Doctor, { foreignKey: "doctorId" });

Appointment.hasOne(MedicalRecord, { foreignKey: "appointmentId" });
MedicalRecord.belongsTo(Appointment, { foreignKey: "appointmentId" });

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

Employee.belongsToMany(Role, {
  through: EmployeeRole,
  foreignKey: "employeeId",
});
Role.belongsToMany(Employee, {
  through: EmployeeRole,
  foreignKey: "roleId",
});

module.exports = {
  Doctor,
  Patient,
  Appointment,
  MedicalRecord,
  DoctorSchedule,
  Room,
  Employee,
  EmployeeRole,
  Role,
  MedicalRecordService,
  Service
};