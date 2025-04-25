// require('dotenv').config();
// const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize({
//     host: process.env.DB_HOST,
//     username: process.env.DB_USER,
//     port: process.env.DB_PORT,
//     password: String(process.env.DB_PASSWORD),
//     database: process.env.DB_NAME,
//     dialect: 'postgres' 
// });

// sequelize.sync({ alter: true })
//   .then(() => {
//     console.log('All models were synchronized successfully.');
//   })
//   .catch((error) => {
//     console.error('Error syncing models:', error);
//   });

// module.exports = sequelize;

require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // chỉ dùng cho dev/test
        }
    }
});

sequelize.sync({ alter: true })
  .then(() => {
    console.log('All models were synchronized successfully.');
  })
  .catch((error) => {
    console.error('Error syncing models:', error);
  });


 module.exports =  sequelize;
//  {
//    up: async (queryInterface, Sequelize) => {
//      await queryInterface.removeConstraint('JobExecute', 'job_execute_user_id');
//    },
//    down: async (queryInterface, Sequelize) => {
//      await queryInterface.addConstraint('JobExecute', {
//        fields: ['userId'],
//        type: 'unique',
//        name: 'job_execute_user_id',
//      });
//    }
   
//  };



