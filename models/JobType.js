const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const JobType = sequelize.define('JobType', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true, // Assuming description is optional
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active',
        validate: {
            isIn: [['active', 'inactive']], // Ensures status is either 'active' or 'inactive'
        },
    },
}, {
    timestamps: true
});

module.exports = JobType;