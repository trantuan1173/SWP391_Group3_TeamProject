const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./Employee");
const bcrypt = require("bcrypt");
const Patient = sequelize.define("Patient", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email:{
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  identityNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dateOfBirth: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  gender: {
    type: DataTypes.ENUM("male", "female"),
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  otpExpires: {
    type: DataTypes.DATE,
    allowNull: true,
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

// Hash password before saving
Patient.beforeCreate(async (patient, options) => {
  if (patient.password) {
    const salt = await bcrypt.genSalt(10)
    patient.password = await bcrypt.hash(patient.password, salt)
  }
});

Patient.beforeUpdate(async (patient, options) => {
  if (patient.changed("password")) {
    const salt = await bcrypt.genSalt(10)
    patient.password = await bcrypt.hash(patient.password, salt)
  }
});

// Method to compare passwords
Patient.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

module.exports = Patient;