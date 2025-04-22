const { DataTypes } = require("sequelize");
const db = require("../config/db");

const Payment = db.define("Payment", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    employerId: { type: DataTypes.UUID, allowNull: false },
    workerId: { type: DataTypes.UUID, allowNull: false },
    jobGroupId: { type: DataTypes.UUID, allowNull: false },
    jobId: { type: DataTypes.UUID, allowNull: false }, // Liên kết công việc
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { 
        type: DataTypes.ENUM("PENDING", "HELD", "RELEASED", "CANCELLED"), 
        defaultValue: "PENDING"
    }
},{
    timestamps: true
}
);

module.exports = Payment;
