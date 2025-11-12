// models/MedicalRecordMedicine.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const MedicalRecordMedicine = sequelize.define(
  "MedicalRecordMedicine",
  {
    medicalRecordId: DataTypes.BIGINT,
    medicineId: DataTypes.BIGINT,
    name: { type: DataTypes.STRING, allowNull: false },
    unit: DataTypes.STRING,
    priceAtUse: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    dose: DataTypes.STRING,
    frequency: DataTypes.STRING,
    duration: DataTypes.STRING,
    route: DataTypes.STRING,
    instructions: DataTypes.TEXT,
    total: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
  },
  {
    tableName: "MedicalRecordMedicines",
  }
);

module.exports = MedicalRecordMedicine;
