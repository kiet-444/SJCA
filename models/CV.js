const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User')

const CV = sequelize.define('CV', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    file: {
        type: DataTypes.BLOB('long'),// luu dang BLOB
        allowNull: false,
    },
    filename: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    experience_year : {
        type: DataTypes.INTEGER,
        allowNull: false,
    },   
    // isDeleted: {
    //     type: DataTypes.BOOLEAN,
    //     allowNull: false,
    //     defaultValue: false,
    // },
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