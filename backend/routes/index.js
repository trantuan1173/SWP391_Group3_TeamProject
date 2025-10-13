const express = require("express");
const DoctorRouter = require("./DoctorRouter");
const PatientRouter = require("./PatientRouter");
const UserRouter = require("./EmployeeRouter");
const ProfileRouter = require("./UserRouter");
const AppointmentRouter = require("./AppointmentRouter");
const AdminRouter = require("./AdminRouter");
const router = express.Router();
const doctorScheduleRouter = require("./DoctorScheduleRouter");
const employeeRouter = require("./EmployeeRouter");
const serviceRouter = require("./ServiceRouter");
const medicalRecordRouter = require("./MedicalRecordRouter");

router.use("/doctors", DoctorRouter);
router.use("/patients", PatientRouter);
router.use("/employees", employeeRouter);
router.use("/users", ProfileRouter);
router.use("/appointments", AppointmentRouter);
router.use("/admin", AdminRouter);
router.use("/doctor-schedules", doctorScheduleRouter);
router.use("/services", serviceRouter);
router.use("/medical-records", medicalRecordRouter);
module.exports = router;
 