const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Doctor = require("./News");
const Patient = require("./Patient");

const Appointment = sequelize.define("Appointment", {
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Patients",
      key: "id",
    },
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "confirmed", "cancelled", "completed"),
    allowNull: false,
    defaultValue: "pending",
  },
  createByType: {
    type: DataTypes.ENUM("patient", "employee"),
    allowNull: false,
    defaultValue: "patient",
  },
  createById: {
    type: DataTypes.INTEGER,
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

module.exports = Appointment;