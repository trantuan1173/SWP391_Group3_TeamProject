const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Room = sequelize.define("Room", {
  name: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    // type: DataTypes.ENUM("khám", "phẫu thuật", "xét nghiệm", "MRI", "CT", "ECG", "X-quang", "y tế khác"),
    type: DataTypes.ENUM("Nội khoa", "Ngoại khoa", "Sản - Nhi", "Da liễu - Thẩm mỹ", "Tâm lý - Tâm thần", "Phục hồi chức năng", "Y học cổ truyền"),
    // allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("available", "unavailable"),
    allowNull: false,
    defaultValue: "available",
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
module.exports = Room;
