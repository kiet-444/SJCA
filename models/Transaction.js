const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const Transaction = sequelize.define('Transaction', {
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id',
        },
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'User',
            key: 'id',
        },
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
       type: DataTypes.ENUM( "HELD", "COMPLETED", "CANCELLED"), 
        defaultValue: "HELD"
    }
}, {
    timestamps: true
});

module.exports = Transaction;