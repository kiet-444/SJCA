const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Service = sequelize.define('Service', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id',
        },
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price : {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    orderCode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true, 
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'inactive',
        validate: {
            isIn: [['active', 'inactive']], 
        },
    },
}, {
    tableName: 'Service',
    timestamps: true
});

module.exports = Service;