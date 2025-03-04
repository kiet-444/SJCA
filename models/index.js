const JobPosting = require('./JobPosting');
const Project = require('./Project');
const User = require('./User');
const JobType = require('./JobType');
const JobExecute = require('./JobExecute');
const Payment = require('./Payment');
const CV = require('./CV');
const Application = require('./Application');


User.hasMany(Project, { foreignKey: 'userId' });
Project.belongsTo(User, { foreignKey: 'userId' });

JobPosting.belongsTo(User, { foreignKey: 'userId' });
JobPosting.belongsTo(Project, { foreignKey: 'projectId' });
Project.hasMany(JobPosting, { foreignKey: 'projectId' });
User.hasMany(JobPosting, { foreignKey: 'userId' });

JobPosting.belongsTo(JobType, { foreignKey: 'jobTypeId' });
JobType.hasMany(JobPosting, { foreignKey: 'jobTypeId' });

JobExecute.belongsTo(JobPosting, { foreignKey: 'jobId' });
JobPosting.hasMany(JobExecute, { foreignKey: 'jobId' });
JobExecute.belongsTo(User, { foreignKey: 'userId' });


Application.belongsTo(JobPosting, { foreignKey: 'jobId' });
Application.belongsTo(CV, { foreignKey: 'cvId' });

module.exports = {
    JobPosting,
    Project,
    User,
    JobExecute,
    JobType,
    Payment,
    CV,
    Application,
};