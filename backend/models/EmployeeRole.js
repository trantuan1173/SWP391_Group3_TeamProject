const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const EmployeeRole = sequelize.define("EmployeeRole", {
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = EmployeeRole;