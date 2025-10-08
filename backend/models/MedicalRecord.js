const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./Employee");
const Appointment = require("./Appointment");
const Patient = require("./Patient");
const Doctor = require("./Doctor");

const MedicalRecord = sequelize.define("MedicalRecord", {
  appointmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Appointments",
      key: "id",
    },
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Patients",
      key: "id",
    },
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Doctors",
      key: "id",
    },
  },
  symptoms: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  diagnosis: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  treatment: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = MedicalRecord;