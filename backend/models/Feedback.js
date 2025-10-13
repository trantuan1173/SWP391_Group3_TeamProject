const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Feedback = sequelize.define("Feedback", {
    appointmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    rating: {
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
})

module.exports = Feedback