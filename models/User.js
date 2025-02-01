const {DataTypes} = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('user', 'employer'),
    allowNull: false,
  },
  taxCode: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isNumeric: true,
      len: [10, 13],
    },
  },
});

module.exports = User;
