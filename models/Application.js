const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const JobPosting = require('./JobPosting'); 
const CV = require('./CV')


const Application = sequelize.define('Application', {
    jobPostingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: JobPosting, 
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



module.exports = Application;