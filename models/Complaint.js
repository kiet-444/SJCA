const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const JobPosting = require('./JobPosting');
const User = require('./User');

const ComplaintRecord = sequelize.define('ComplaintRecord', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    jobPostingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: JobPosting,
            key: 'id',
        },
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',
    },
}, {
    timestamps: true
});

module.exports = ComplaintRecord;