const bcrypt = require('bcryptjs');
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false
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
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  // education: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
  // experience: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
  // skills: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
  // taxCode: {
  //   type: DataTypes.STRING,
  //   allowNull: true,
  //   unique: true,
  //   validate: {
  //     isNumeric: true,
  //     len: [10, 13],
  //   },
  // },
  cccd: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isNumeric: true,
        len: [12],
      }
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  verificationToken: {
    type: DataTypes.STRING,
    allowNull: true,
  }, 
},  { freezeTableName: true });

// Hash password before saving

User.beforeCreate(async (user) => {
  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  } catch (error) {
    throw new Error('Error hashing password');
  }
});


// Method to compare password
User.prototype.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;
