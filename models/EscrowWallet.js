const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const EscrowWallet = sequelize.define('EscrowWallet', {
    jobGroupId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'JobGroup',
            key: 'id',
        },
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id',
        },
    },
    balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    orderCode: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    timestamps: true
});

module.exports = EscrowWallet;