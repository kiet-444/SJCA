const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Payment = sequelize.define("Payment", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    employerId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    workerId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM("HOLD", "SUCCESS", "FAILED"),
        defaultValue: "HOLD",
    },
});

module.exports = Payment;
