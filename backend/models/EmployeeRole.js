const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const EmployeeRole = sequelize.define("EmployeeRole", {
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Employees",
      key: "id",
    },
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Roles",
      key: "id",
    },
  },
});

module.exports = EmployeeRole;