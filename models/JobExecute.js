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
    processComplete: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
            isIn: [['success', 'active', 'failed']],
        },
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    checkin_img: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    checkout_img: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    note: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    work_process: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'JobExecute',
    freezeTableName: true,
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['jobPostingId', 'userId'],
        },
    ]
});

module.exports = JobExecute;