// const Doctor = require("./Doctor");
const Patient = require("./Patient");
const Appointment = require("./Appointment");
const MedicalRecord = require("./MedicalRecord");
const DoctorSchedule = require("./DoctorSchedule");
const Room = require("./Room");
const Employee = require("./Employee");
const EmployeeRole = require("./EmployeeRole");
const Role = require("./Role");
const Service = require("./Service");
const MedicalRecordService = require("./MedicalRecordService");
const Feedback = require("./Feedback");
const News = require("./News");

Feedback.belongsTo(Appointment, { foreignKey: "appointmentId" });
Appointment.hasOne(Feedback, { foreignKey: "appointmentId" });

Feedback.belongsTo(Patient, { foreignKey: "patientId" });
Patient.hasOne(Feedback, { foreignKey: "patientId" });


MedicalRecord.belongsToMany(Service, {
  through: MedicalRecordService,
  foreignKey: "medicalRecordId",
});
Service.belongsToMany(MedicalRecord, {
  through: MedicalRecordService,
  foreignKey: "serviceId",
});

EmployeeRole.belongsTo(Employee, { 
  foreignKey: 'employeeId',
  as: 'employee'  
});
EmployeeRole.belongsTo(Role, { foreignKey: "roleId" });

Employee.hasMany(EmployeeRole, { 
  foreignKey: 'employeeId',
  as: 'employeeRoles'
});

Employee.hasMany(Appointment, { foreignKey: "doctorId" });
Appointment.belongsTo(Employee, { foreignKey: "doctorId" });
Employee.hasMany(MedicalRecord, { foreignKey: "doctorId" });
MedicalRecord.belongsTo(Employee, { foreignKey: "doctorId" });

Appointment.hasOne(MedicalRecord, { foreignKey: "appointmentId" });
MedicalRecord.belongsTo(Appointment, { foreignKey: "appointmentId" });

Patient.hasMany(Appointment, { foreignKey: "patientId" });
Appointment.belongsTo(Patient, { foreignKey: "patientId" });
Patient.hasMany(MedicalRecord, { foreignKey: "patientId" });
MedicalRecord.belongsTo(Patient, { foreignKey: "patientId" });

Employee.hasMany(DoctorSchedule, { foreignKey: "doctorId" });
DoctorSchedule.belongsTo(Employee, { foreignKey: "doctorId" });

Room.hasMany(Appointment, { foreignKey: "roomId" });
Appointment.belongsTo(Room, { foreignKey: "roomId" });

Room.hasMany(MedicalRecord, { foreignKey: "roomId" });
MedicalRecord.belongsTo(Room, { foreignKey: "roomId" });

Employee.belongsToMany(Role, {
  through: EmployeeRole,
  foreignKey: "employeeId",
  as: 'roles'
});
Role.belongsToMany(Employee, {
  through: EmployeeRole,
  foreignKey: "roleId",
  as: 'employees'
});

News.belongsTo(Employee, { foreignKey: "createdBy" });
Employee.hasMany(News, { foreignKey: "createdBy" });

module.exports = {
  Patient,
  Appointment,
  MedicalRecord,
  DoctorSchedule,
  Room,
  Employee,
  EmployeeRole,
  Role,
  MedicalRecordService,
  Service,
  News
};