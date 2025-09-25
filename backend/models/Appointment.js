const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Doctor = require("./Doctor");
const Patient = require("./Patient");
const User = require("./User");

const Appointment = sequelize.define("Appointment", {
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "Doctors",
      key: "id",
    },
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
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
  createBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
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