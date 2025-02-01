const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Import kết nối Sequelize
const JobType = require('./JobType'); // Import model JobType

const Job = sequelize.define('Job', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false, 
    },
    salary: {
        type: DataTypes.DECIMAL(10, 2), // Lương với 10 chữ số tổng cộng và 2 chữ số thập phân
        allowNull: true, // Lương có thể để trống
    },
    expired_date: {
        type: DataTypes.DATE,
        allowNull: false, // Ngày hết hạn là bắt buộc
    },
    job_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // ID của JobType là bắt buộc
        references: {
            model: JobType, // Tham chiếu đến model JobType
            key: 'id', // Tham chiếu đến trường `id` của JobType
        },
    },
});

// Thiết lập quan hệ giữa Job và JobType
Job.belongsTo(JobType, { foreignKey: 'job_type_id' }); // Một Job thuộc về một JobType
JobType.hasMany(Job, { foreignKey: 'job_type_id' }); // Một JobType có nhiều Job

module.exports = Job;