const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Appointment = require("./Appointment");
const Patient = require("./Patient");

const Payment = sequelize.define("Payment", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  appointmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Appointment,
      key: "id",
    },
  },

  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Patient,
      key: "id",
    },
  },

  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  method: {
    type: DataTypes.ENUM("cash", "card", "payos"),
    allowNull: false,
  },

  transactionId: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // ✅ Thêm orderCode
  orderCode: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },

  // ✅ Thêm reference (mã GD ngân hàng)
  reference: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // ✅ Thêm transactionDateTime
  transactionDateTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  status: {
    type: DataTypes.ENUM("pending", "paid", "failed"),
    defaultValue: "pending",
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

module.exports = Payment;
