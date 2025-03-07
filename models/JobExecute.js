const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 

const JobExecute = sequelize.define('JobExecute', {
    jobPostingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'JobPosting',
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
    assigned_at: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    checkin_at: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    checkout_at: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active',
        validate: {
            isIn: [['active', 'inactive']], // Ensures status is either 'active' or 'inactive'
        },
    },
    note: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    work_process: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true
},  { freezeTableName: true });

module.exports = JobExecute;