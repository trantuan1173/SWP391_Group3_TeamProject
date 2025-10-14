const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Employee = require("./Employee");

const News = sequelize.define("News", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.TEXT("long"),
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tag: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  content: {
    type: DataTypes.TEXT,
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

module.exports = News;
