const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./Employee");

const Doctor = sequelize.define("Doctor", {
  speciality: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
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

module.exports = Doctor;
