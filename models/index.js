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
const EsrowWallet = require('./EscrowWallet');
const Transaction = require('./Transaction');
const Service = require('./Service');

// // User - Project
// User.hasMany(JobGroup, { foreignKey: 'userId' });
// JobGroup.belongsTo(User, { foreignKey: 'userId' });

// // JobPosting - JobType
// JobPosting.belongsTo(JobType, { foreignKey: 'jobTypeId' });
// JobType.hasMany(JobPosting, { foreignKey: 'jobTypeId' });

// // JobPosting - User & Project
// JobPosting.belongsTo(User, { foreignKey: 'userId' });
// JobPosting.belongsTo(JobGroup, { foreignKey: 'projectId' });
// JobGroup.hasMany(JobPosting, { foreignKey: 'projectId' });
// User.hasMany(JobPosting, { foreignKey: 'userId' });

// // JobExecute - JobPosting & User
// JobExecute.belongsTo(JobPosting, { foreignKey: 'id' }); // Đảm bảo id đúng
// JobPosting.hasMany(JobExecute, { foreignKey: 'id' });
// JobExecute.belongsTo(User, { foreignKey: 'userId' });

// // Application - JobPosting & CV
// Application.belongsTo(JobPosting, { foreignKey: 'id' });
// Application.belongsTo(CV, { foreignKey: 'cvId' });

// //ComplaintRecord - User
// ComplaintRecord.belongsTo(User, { foreignKey: 'userId' });

// //Payment - User
// Payment.belongsTo(User, { foreignKey: 'userId' });

// //CV - User
// CV.belongsTo(User, { foreignKey: 'userId' });

// //Review - User
// User.hasMany(Review, { foreignKey: 'userId', onDelete: 'CASCADE' });
// Review.belongsTo(User, { foreignKey: 'userId' });

// User - JobGroup
User.hasMany(JobGroup, { foreignKey: 'userId' });
JobGroup.belongsTo(User, { foreignKey: 'userId' });

// JobPosting - JobType
JobPosting.belongsTo(JobType, { foreignKey: 'jobTypeId' });
JobType.hasMany(JobPosting, { foreignKey: 'jobTypeId' });

// JobPosting - User & JobGroup
JobPosting.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(JobPosting, { foreignKey: 'userId' });

JobPosting.belongsTo(JobGroup, { foreignKey: 'jobGroupId' });
JobGroup.hasMany(JobPosting, { foreignKey: 'jobGroupId' });

// JobExecute - JobPosting & User
JobExecute.belongsTo(JobPosting, { foreignKey: 'jobPostingId' });
JobPosting.hasMany(JobExecute, { foreignKey: 'jobPostingId' });

JobExecute.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(JobExecute, { foreignKey: 'userId' });

// Application - JobPosting & CV
Application.belongsTo(JobPosting, { foreignKey: 'jobPostingId' });
Application.belongsTo(CV, { foreignKey: 'cvId' });

// ComplaintRecord - User
ComplaintRecord.belongsTo(User, { foreignKey: 'userId' });

// Payment - User
Payment.belongsTo(User, { foreignKey: 'userId' });

// EscrowWallet - User
EsrowWallet.belongsTo(User, { foreignKey: 'userId' });
EsrowWallet.belongsTo(JobPosting, { foreignKey: 'jobPostingId' });


// CV - User
CV.belongsTo(User, { foreignKey: 'userId' });

// Review - User
User.hasMany(Review, { foreignKey: 'userId', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'userId' });

// Transaction - EscrowWallet
Transaction.belongsTo(EsrowWallet, { foreignKey: 'escrowWalletId' });
EsrowWallet.hasMany(Transaction, { foreignKey: 'escrowWalletId' });

//Service - User
Service.belongsTo(User, { foreignKey: 'userId' });



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
    Review,
    Transaction,
    EsrowWallet,
    Service,
};
