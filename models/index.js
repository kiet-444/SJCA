const User = require('./User');  
const JobGroup = require('./JobGroup');
const JobPosting = require('./JobPosting');
const JobType = require('./JobType');
const JobExecute = require('./JobExecute');
const Payment = require('./Payment');
const CV = require('./CV');
const Application = require('./Application');
const ComplaintRecord = require('./Complaint');
const Review = require('./Review');

// User - Project
User.hasMany(JobGroup, { foreignKey: 'userId' });
JobGroup.belongsTo(User, { foreignKey: 'userId' });

// JobPosting - JobType
JobPosting.belongsTo(JobType, { foreignKey: 'jobTypeId' });
JobType.hasMany(JobPosting, { foreignKey: 'jobTypeId' });

// JobPosting - User & Project
JobPosting.belongsTo(User, { foreignKey: 'userId' });
JobPosting.belongsTo(JobGroup, { foreignKey: 'projectId' });
JobGroup.hasMany(JobPosting, { foreignKey: 'projectId' });
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

//Payment - User
Payment.belongsTo(User, { foreignKey: 'userId' });

//CV - User
CV.belongsTo(User, { foreignKey: 'userId' });

//Review - User
User.hasMany(Review, { foreignKey: 'userId', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'userId' });



module.exports = {
    JobGroup,
    JobType,
    JobPosting,
    User,
    JobExecute,
    Payment,
    CV,
    Application,
    ComplaintRecord,
    Review
};
