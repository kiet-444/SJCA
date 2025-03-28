const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const CV = sequelize.define('CV', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    file_Id: {
        type: DataTypes.STRING, 
        allowNull: false,
    },
    file_Url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    filename: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Default', 'Casual', 'Deleted'),
        allowNull: false,
        defaultValue: 'Casual',
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

CV.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(CV, { foreignKey: 'userId' });

module.exports = CV;
