const {DataTypes} = require('sequelize');
const sequelize = require('../config/db');

const JobGroup = sequelize.define('JobGroup', {
    title: {
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
        defaultValue: 'active',
        validate: {
            isIn: [['active', 'inactive', 'completed']],
        },
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id',
        },
    }
}, {
    tableName: 'JobGroup',
    timestamps: true
});

module.exports = JobGroup;