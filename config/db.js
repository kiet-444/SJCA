require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: String(process.env.DB_PASSWORD),
    database: process.env.DB_NAME,
    dialect: 'postgres' 
});

sequelize
    .authenticate()
    .then(() => console.log('Connection has been established successfully.'))
    // .catch(err => console.error('Unable to connect to the database:', err));

module.exports = sequelize;