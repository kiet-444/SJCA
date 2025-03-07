const User = require('./User');  
const Project = require('./Project');
const JobPosting = require('./JobPosting');
const JobType = require('./JobType');
const JobExecute = require('./JobExecute');
const Payment = require('./Payment');
const CV = require('./CV');
const Application = require('./Application');
const ComplaintRecord = require('./Complaint');

// User - Project
User.hasMany(Project, { foreignKey: 'userId' });
Project.belongsTo(User, { foreignKey: 'userId' });

// JobPosting - JobType
JobPosting.belongsTo(JobType, { foreignKey: 'jobTypeId' });
JobType.hasMany(JobPosting, { foreignKey: 'jobTypeId' });

// JobPosting - User & Project
JobPosting.belongsTo(User, { foreignKey: 'userId' });
JobPosting.belongsTo(Project, { foreignKey: 'projectId' });
Project.hasMany(JobPosting, { foreignKey: 'projectId' });
User.hasMany(JobPosting, { foreignKey: 'userId' });

// JobExecute - JobPosting & User
JobExecute.belongsTo(JobPosting, { foreignKey: 'id' }); // Đảm bảo id đúng
JobPosting.hasMany(JobExecute, { foreignKey: 'id' });
JobExecute.belongsTo(User, { foreignKey: 'userId' });

// Application - JobPosting & CV
Application.belongsTo(JobPosting, { foreignKey: 'id' });
Application.belongsTo(CV, { foreignKey: 'cvId' });

//ComplaintRecord - User
ComplaintRecord.belongsTo(User, { foreignKey: 'userId' });


module.exports = {
    Project,
    JobType,
    JobPosting,
    User,
    JobExecute,
    Payment,
    CV,
    Application,
    ComplaintRecord
};
