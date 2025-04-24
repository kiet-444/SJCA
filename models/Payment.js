const { DataTypes } = require("sequelize");
const sequelize = require('../config/db');

const Payment = sequelize.define("Payment", {
    orderCode: { type: DataTypes.STRING, allowNull: false },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    employerId: { type: DataTypes.UUID, allowNull: false },
    workerId: { type: DataTypes.UUID, allowNull: true },
    jobGroupId: { type: DataTypes.UUID, allowNull: false },
    jobId: { type: DataTypes.UUID, allowNull: true }, // Liên kết công việc
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { 
        type: DataTypes.ENUM( "PENDING", "HELD", "RELEASED", "CANCELLED"), 
        defaultValue: "PENDING"
    }
},{
    timestamps: true
}
);

module.exports = Payment;
