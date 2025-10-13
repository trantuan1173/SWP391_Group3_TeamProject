const express = require("express");
const DoctorRouter = require("./DoctorRouter");
const PatientRouter = require("./PatientRouter");
const UserRouter = require("./EmployeeRouter");
const ProfileRouter = require("./UserRouter");
const AppointmentRouter = require("./AppointmentRouter");
const AdminRouter = require("./AdminRouter");
const router = express.Router();

router.use("/doctors", DoctorRouter);
router.use("/patients", PatientRouter);
router.use("/employees", UserRouter);
router.use("/users", ProfileRouter);
router.use("/appointments", AppointmentRouter);
router.use("/admin", AdminRouter);

module.exports = router;
 