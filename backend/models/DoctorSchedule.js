const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Doctor = require("./Doctor");

const DoctorSchedule = sequelize.define("DoctorSchedule", {
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Doctors",
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

module.exports = DoctorSchedule;