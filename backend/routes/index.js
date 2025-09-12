const express = require("express");
const DoctorRouter = require("./DoctorRouter");
const PatientRouter = require("./PatientRouter");
const UserRouter = require("./UserRouter");
const router = express.Router();


router.use("/doctor", DoctorRouter);
router.use("/patient", PatientRouter);
router.use("/user", UserRouter);

module.exports = router;