const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Employee = require("./Employee");

const Medicine = sequelize.define("Medicine", {
  name: {
    type: DataTypes.STRING,
    allowNull: false, // Tên thuốc bắt buộc
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true, // Mô tả / công dụng
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false, // Đơn vị: viên, hộp, chai...
  },
  form: {
    type: DataTypes.STRING,
    allowNull: true, // Dạng bào chế: viên nén, siro...
  },
  route: {
    type: DataTypes.STRING,
    allowNull: true, // Đường dùng: uống, tiêm...
  },
  strength: {
    type: DataTypes.STRING,
    allowNull: true, // Hàm lượng: 500mg, 5mg/ml...
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
    defaultValue: true, // Có cần đơn bác sĩ không
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false, // id nhân viên lễ tân tạo thuốc
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
