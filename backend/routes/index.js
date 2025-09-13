const express = require("express");
const DoctorRouter = require("./DoctorRouter");
const PatientRouter = require("./PatientRouter");
const UserRouter = require("./UserRouter");
const StaffRouter = require("./StaffRouter");
const router = express.Router();


router.use("/doctors", DoctorRouter);
router.use("/patients", PatientRouter);
router.use("/users", UserRouter);
router.use("/staffs", StaffRouter);

module.exports = router;