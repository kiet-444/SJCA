const CV = require('../models/CV');
const CV_JOB = require('../models/CV_JOB');
const User = require('../models/User');
const Job = require('../models/Job');

const CVManagementController = { 

    async createCV(req, res) {
        try {
            const userId = req.userId;
            const {file, experience_year} = res.body;

            const newCV = await CV.create({
                userId,
                file,
                experience_year
            });
            return res.status(201).json({
                message: 'CV đã được tạo thành công.',
                data: newCV,
            });
        } catch (error) {
            console.error('Lỗi khi tạo CV:', error);
            return res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo CV.' });
        }
    },
    
    async getUserCVs(req, res) {
        try {
            const { userId } = req.params;

            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: 'Người dùng không tồn tại.' });
            }

            const cvs = await CV.findAll({
                where: { userId },
            });

            return res.status(200).json({
                message: 'Danh sách CV của người dùng.',
                data: cvs,
            });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách CV:', error);
            return res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách CV.' });
        }
    },

    // Gửi CV ứng tuyển công việc
    async applyForJob(req, res) {
        try {
            const { jobId, cvId } = req.body;

            const job = await Job.findByPk(jobId);
            const cv = await CV.findByPk(cvId);

            if (!job || !cv) {
                return res.status(404).json({ message: 'Người dùng, công việc hoặc CV không tồn tại.' });
            }
        // Tạo mới ứng tuyển
            const newApplication = await CV_JOB.create({
                jobId,
                cvId,
                status: 'pending',
            });

            return res.status(201).json({
                message: 'Ứng tuyển thành công.',
                data: newApplication,
            });
        } catch (error) {
            console.error('Lỗi khi ứng tuyển:', error);
            return res.status(500).json({ message: 'Đã xảy ra lỗi khi ứng tuyển.' });
        }
    },

}

module.exports = CVManagementController;