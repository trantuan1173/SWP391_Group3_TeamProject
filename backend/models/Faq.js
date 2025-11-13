const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Faq = sequelize.define(
  "Faq",
  {
    title: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: true },
    categoryId: { type: DataTypes.INTEGER, allowNull: false },
    views: { type: DataTypes.INTEGER, defaultValue: 0 },
    createdBy: { type: DataTypes.INTEGER, allowNull: true },
  },
  { timestamps: true }
);

module.exports = Faq;
