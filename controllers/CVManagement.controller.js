const CV = require('../models/CV');
const User = require('../models/User');
const Job = require('../models/Job');
const CV_JOB = require('../models/CV_JOB');

const CVManagementController = { 

    // Upload CV vào database
    async uploadCV(req, res) {
        try {
            const userId = req.userId;
            const { experience_year } = req.body;

            if (!req.file) {
                return res.status(400).json({ message: 'Vui lòng tải lên một tệp.' });
            }

            // Lưu file dưới dạng Buffer trong database
            const newCV = await CV.create({
                userId,
                filename: req.file.originalname,
                file: req.file.buffer,
                fileType: req.file.mimetype,
                experience_year
            });

            return res.status(201).json({
                message: 'CV đã được tải lên thành công.',
                data: newCV.id, 
            });
        } catch (error) {
            console.error('Lỗi khi tải lên CV:', error);
            return res.status(500).json({ message: 'Đã xảy ra lỗi khi tải lên CV.' });
        }
    },

    // Lấy danh sách CV của người dùng
    async getUserCVs(req, res) {
        try {
            const { userId } = req.params;
            const user = await User.findByPk(userId);

            if (!user) {
                return res.status(404).json({ message: 'Người dùng không tồn tại.' });
            }

            const cvs = await CV.findAll({
                where: { userId },
                attributes: ['id', 'experience_year', 'filename', 'createdAt'] 
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

    // Lấy file CV 
    async getCVFile(req, res) {
        try {
            const { cvId } = req.params;
            const cv = await CV.findByPk(cvId);
    
            if (!cv) {
                return res.status(404).json({ message: 'CV không tồn tại.' });
            }
    
            // Lấy kiểu file dựa vào trường fileType hoặc filename
            const mimeType = cv.filename || 'application/octet-stream'; 
            
            res.setHeader('Content-Type', mimeType);
            res.setHeader('Content-Disposition', `attachment; filename="${cv.filename}"`);
            
            res.send(cv.file);
        } catch (error) {
            console.error('Lỗi khi lấy CV:', error);
            return res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy CV.' });
        }
    }
    ,

    async applyForJob(req, res) {
        try {
            const { jobId, cvId } = req.body;

            const job = await Job.findByPk(jobId);
            const cv = await CV.findByPk(cvId);

            if (!job || !cv) {
                return res.status(404).json({ message: 'Người dùng, công việc hoặc CV không tồn tại.' });
            }

            // Kiểm tra xem CV đã ứng tuyển công việc này chưa
            const existingApplication = await CV_JOB.findOne({
                where: { jobId, cvId },
            });

            if (existingApplication) {
                return res.status(400).json({ message: 'Bạn đã ứng tuyển công việc này bằng CV này.' });
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
};

module.exports = CVManagementController;
