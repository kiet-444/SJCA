const { CV, 
        User, 
        JobPosting, 
        Application } = require('../models');

const CVManagementController = { 

    async uploadCV(req, res) {
        try {
            const userId = req.userId;
            const { file_Id, file_Url, filename } = req.body;

            const newCV = await CV.create({
                userId,
                file_Id,
                file_Url,
                filename
            });

            return res.status(201).json({
                message: 'CV is uploaded successfully.',
                data: newCV.id, 
            });
        } catch (error) {
            console.error('Wrong when uploading CV:', error);
            return res.status(500).json({ message: 'wrong when uploading CV' });
        }
    },

    // Lấy danh sách CV của người dùng
    async getUserCVs(req, res) {
        try {
            const { userId } = req.params;
            const user = await User.findByPk(userId);

            if (!user) {
                return res.status(404).json({ message: 'The user is not found' });
            }

            const cvs = await CV.findAll({
                where: { userId },
                attributes: ['id', 'filename', 'file_Url', 'createdAt', 'updatedAt', 'status'], 
            });

            return res.status(200).json({
                message: 'List of CVs is retrieved successfully.',
                data: cvs,
            });
        } catch (error) {
            console.error('Wrong when get list of CVs:', error);
            return res.status(500).json({ message: 'Wrong when get list of CVs' });
        }
    },

    async deleteCV(req, res) {
        try {
            const { cvId } = req.params;
            const cv = await CV.findByPk(cvId);

            if (!cv) {
                return res.status(404).json({ message: 'CV is not found' });
            }

            await CV.update({status : 'Deleted'}, { where: { id: cvId } });
            return res.status(200).json({ message: 'CV is deleted successfully.' });
        } catch (error) {
            console.error('Wrong when deleting CV:', error);
            return res.status(500).json({ message: 'Wrong when deleting CV' });
        }
    },

    async setDefaultCV(req, res) {
        try {
            const { userId, cvId } = req.params; 

            if (!userId || !cvId) {
                return res.status(400).json({ message: 'userId and cvId are required' });
            }

            // Reset the current default CV
            const resetDefault = await CV.update(
                { status: 'Casual' },
                { where: { userId, status: 'Default' } }
            );
            console.log('Reset Default Result:', resetDefault);

            // Set the new default CV
            const setDefault = await CV.update(
                { status: 'Default' },
                { where: { id: cvId, userId } } // Ensure the cvId belongs to the userId
            );
            console.log('Set Default Result:', setDefault);

            if (setDefault[0] === 0) {
                return res.status(404).json({ message: 'CV not found or could not be updated' });
            }

            return res.status(200).json({ message: 'Default CV is set successfully.' });
        } catch (error) {
            console.error('Error in setDefaultCV:', error);
            return res.status(500).json({ message: 'Wrong when set default CV' });
        }
    },


    // Lấy file CV 
    // async getCVFile(req, res) {
    //     try {
    //         const { cvId } = req.params;
    //         const cv = await CV.findByPk(cvId);
    
    //         if (!cv) {
    //             return res.status(404).json({ message: 'CV không tồn tại.' });
    //         }
    
    //         // Lấy kiểu file dựa vào trường fileType hoặc filename
    //         const mimeType = cv.filename || 'application/octet-stream'; 
            
    //         res.setHeader('Content-Type', mimeType);
    //         res.setHeader('Content-Disposition', `attachment; filename="${cv.filename}"`);
            
    //         res.send(cv.file);
    //     } catch (error) {
    //         console.error('Lỗi khi lấy CV:', error);
    //         return res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy CV.' });
    //     }
    // },

    async previewCV(req, res) {
        try {
            const { cvId } = req.params;
            const cv = await CV.findByPk(cvId);
            const mimeType = cv.filename || 'application/octet-stream';

            res.setHeader('Content-Type', mimeType);
            res.setHeader('Content-Disposition', `inline; filename="${cv.filename}"`);

            res.send(cv.file_Url);

            if (!cv) {
                return res.status(404).json({ message: 'CV không tồn tại.' });
            }

            return res.status(200).json({
                message: 'Xem trước CV thành công.',
                data: {
                    file_Url: cv.file_Url,
                    filename: cv.filename
                }
            });
        } catch (error) {
            console.error('Lỗi khi xem trước CV:', error);
            return res.status(500).json({ message: 'Đã xảy ra lỗi khi xem trước CV.' });
        }
    },

    async applyForJob(req, res) {
        try {
            const { jobPostingId, cvId } = req.body;

            const job = await JobPosting.findByPk(jobPostingId);
            const cv = await CV.findByPk(cvId);

            if (!job || !cv) {
                return res.status(404).json({ message: 'Người dùng, công việc hoặc CV không tồn tại.' });
            }

            // Kiểm tra xem CV đã ứng tuyển công việc này chưa
            const existingApplication = await Application.findOne({
                where: { jobPostingId, cvId },
            });

            if (existingApplication) {
                return res.status(400).json({ message: 'Bạn đã ứng tuyển công việc này bằng CV này.' });
            }

            // Tạo mới ứng tuyển
            const newApplication = await Application.create({
                jobPostingId,
                cvId,
                status: 'submitted',
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

    async getApplicationsByCV(req, res) {
        try {
            const { cvId } = req.params;
            const applications = await Application.findAll({
                where: { cvId },
                include: [JobPosting]
            });

            return res.status(200).json({
                message: 'Danh sách các đơn ứng tuyển theo CV.',
                data: applications,
            });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách đơn ứng tuyển:', error);
            return res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách đơn ứng tuyển.' });
        }
    },
};

module.exports = CVManagementController;
