const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const MedicalRecordService = sequelize.define("MedicalRecordService", {
  medicalRecordId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  serviceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity:{
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total:{
    type: DataTypes.BIGINT,
    allowNull: false
  }
});

module.exports = MedicalRecordService;