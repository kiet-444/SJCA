const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 

const JobPosting = sequelize.define('JobPosting', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false, 
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    number_of_person: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    payment_type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    gender_requirement: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    min_star_requirement: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    min_job_requirement: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active',
        validate: {
            isIn: [['active', 'inactive']],
        },
    },
    expired_date: {
        type: DataTypes.DATE,
        allowNull: false, 
    },
    working_time: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    started_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    salary: {
        type: DataTypes.DECIMAL(10, 2), // Lương với 10 chữ số tổng cộng và 2 chữ số thập phân
        allowNull: true, // Lương có thể để trống
    },
    jobTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'JobType',
            key: 'id',
        },
    },
    jobGroupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
}, {
    tableName: 'JobPosting',
    timestamps: true
} );

module.exports = JobPosting;