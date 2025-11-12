// const Doctor = require("./Doctor");
const Patient = require("./Patient");
const Appointment = require("./Appointment");
const MedicalRecord = require("./MedicalRecord");
// const DoctorSchedule = require("./DoctorSchedule");
const Room = require("./Room");
const Employee = require("./Employee");
const EmployeeRole = require("./EmployeeRole");
const Role = require("./Role");
const Service = require("./Service");
const MedicalRecordService = require("./MedicalRecordService");
const Feedback = require("./Feedback");
const News = require("./News");
const Payment = require("./Payment");
const Ticket = require("./Ticket");
const Category = require("./Category");
const Faq = require("./Faq");
const MedicalRecordMedicine = require("./MedicalRecordMedicine");
const Medicine = require("./Medicine");

Appointment.hasOne(Payment, { foreignKey: "appointmentId" });
Payment.belongsTo(Appointment, { foreignKey: "appointmentId" });

Patient.hasMany(Payment, { foreignKey: "patientId" });
Payment.belongsTo(Patient, { foreignKey: "patientId" });

Feedback.belongsTo(Appointment, { foreignKey: "appointmentId" });
Appointment.hasOne(Feedback, { foreignKey: "appointmentId" });

Feedback.belongsTo(Patient, { foreignKey: "patientId" });
Patient.hasOne(Feedback, { foreignKey: "patientId" });
Appointment.hasMany(Feedback, { foreignKey: "appointmentId" });
MedicalRecord.belongsToMany(Service, {
  through: MedicalRecordService,
  foreignKey: "medicalRecordId",
});
Service.belongsToMany(MedicalRecord, {
  through: MedicalRecordService,
  foreignKey: "serviceId",
});

// fix here ↓
EmployeeRole.belongsTo(Employee, { foreignKey: "employeeId", as: "employee" });
EmployeeRole.belongsTo(Role, { foreignKey: "roleId", as: "role" }); // fix here

Employee.belongsToMany(Role, {
  through: EmployeeRole,
  foreignKey: "employeeId",
  as: "roles", // fix here
});

Role.belongsToMany(Employee, {
  through: EmployeeRole,
  foreignKey: "roleId",
  as: "employees",
});

// Sửa lỗi EagerLoadingError: EmployeeRole is not associated to Employee
Employee.hasMany(EmployeeRole, {
  foreignKey: "employeeId",
  as: "employeeRoles",
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

// Employee.hasMany(DoctorSchedule, { foreignKey: "doctorId" });
// DoctorSchedule.belongsTo(Employee, { foreignKey: "doctorId" });

Room.hasMany(Appointment, { foreignKey: "roomId" });
Appointment.belongsTo(Room, { foreignKey: "roomId" });

Room.hasMany(MedicalRecord, { foreignKey: "roomId" });
MedicalRecord.belongsTo(Room, { foreignKey: "roomId" });

News.belongsTo(Employee, { foreignKey: "createdBy" });
Employee.hasMany(News, { foreignKey: "createdBy" });

// Thêm associations cho DoctorSchedule và Room
// DoctorSchedule.belongsTo(Room, { foreignKey: "roomId" });
// Room.hasMany(DoctorSchedule, { foreignKey: "roomId" });

// Category 1 — N Faq (FAQ bắt buộc thuộc 1 category)
Category.hasMany(Faq, {
  foreignKey: "categoryId",
  as: "faqs",
  onDelete: "RESTRICT",
});
Faq.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

// Faq.createdBy → Employee
Employee.hasMany(Faq, { foreignKey: "createdBy", as: "createdFaqs" });
Faq.belongsTo(Employee, { foreignKey: "createdBy", as: "creator" });

// (Tuỳ chọn) Category 1 — N Ticket: giúp route ticket đúng nhóm
Category.hasMany(Ticket, {
  foreignKey: "categoryId",
  as: "tickets",
  onDelete: "SET NULL",
});
Ticket.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

// Ticket.userId → Patient (người gửi ticket)
Patient.hasMany(Ticket, { foreignKey: "userId", as: "tickets" });
Ticket.belongsTo(Patient, { foreignKey: "userId", as: "user" });

// Ticket.answeredBy → Employee (nhân viên trả lời)
Employee.hasMany(Ticket, { foreignKey: "answeredBy", as: "answeredTickets" });
Ticket.belongsTo(Employee, {
  foreignKey: "answeredBy",
  as: "answeredByEmployee",
});

MedicalRecord.belongsToMany(Medicine, {
  through: MedicalRecordMedicine,
  foreignKey: "medicalRecordId",
  otherKey: "medicineId",
  as: "medicines",
});

Medicine.belongsToMany(MedicalRecord, {
  through: MedicalRecordMedicine,
  foreignKey: "medicineId",
  otherKey: "medicalRecordId",
  as: "medicalRecords",
});

// liên kết chi tiết snapshot
MedicalRecord.hasMany(MedicalRecordMedicine, {
  foreignKey: "medicalRecordId",
  as: "prescribedMedicines",
});
MedicalRecordMedicine.belongsTo(MedicalRecord, {
  foreignKey: "medicalRecordId",
  as: "medicalRecord",
});

Medicine.hasMany(MedicalRecordMedicine, {
  foreignKey: "medicineId",
  as: "prescriptions",
});
MedicalRecordMedicine.belongsTo(Medicine, {
  foreignKey: "medicineId",
  as: "medicine",
});
module.exports = {
  Patient,
  Appointment,
  MedicalRecord,
  // DoctorSchedule,
  Room,
  Employee,
  EmployeeRole,
  Role,
  MedicalRecordService,
  Service,
  Feedback,
  News,
  Payment,
  Category,
  Faq,
  Ticket,
  Medicine,
  MedicalRecordMedicine,
};
