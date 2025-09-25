const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");

const Patient = sequelize.define("Patient", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },
  // dateOfBirth: {
  //   type: DataTypes.DATE,
  //   allowNull: false,
  // },
  // gender: {
  //   type: DataTypes.ENUM("male", "female"),
  //   allowNull: false,
  // },
  // address: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
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
Patient.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Patient;