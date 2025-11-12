const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Employee = require("./Employee");

const Medicine = sequelize.define("Medicine", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  form: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  route: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  strength: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  manufacturer: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isPrescription: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  createdBy: {
    type: DataTypes.INTEGER,
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

Medicine.belongsTo(Employee, { foreignKey: "createdBy", as: "creator" });
Employee.hasMany(Medicine, { foreignKey: "createdBy" });

module.exports = Medicine;
