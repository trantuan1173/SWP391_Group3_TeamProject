const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Policy = sequelize.define("Policy", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contentHtml: {
    type: DataTypes.TEXT("long"),
    allowNull: false,
  },
  contentDelta: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("active", "inactive"),
    allowNull: false,
    defaultValue: "active",
  },
  lastEditedBy: {
    type: DataTypes.INTEGER,
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

module.exports = Policy;
