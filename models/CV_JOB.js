const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Job = require('./Job'); 
const CV = require('./CV')


const CV_JOB = sequelize.define('CV_JOB', {
    jobId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Job, 
            key: 'id',
        },
    },
    cvId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: CV, 
            key: 'id', 
        },
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'), 
        allowNull: false,
        defaultValue: 'pending',
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
});

CV_JOB.belongsTo(Job, { foreignKey: 'jobId' });
CV_JOB.belongsTo(CV, { foreignKey: 'cvId' });

module.exports = CV_JOB;