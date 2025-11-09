const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Ticket = sequelize.define("Ticket", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("open", "in-progress", "resolved"),
    defaultValue: "open",
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  answeredBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = Ticket;
