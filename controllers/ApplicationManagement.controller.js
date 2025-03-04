const { Application, CV, User, JobPosting } = require('../models');


const ApplicationManagementController = {

    // Lấy danh sách ứng viên cho công việc
    async getApplicationsForJob(req, res) {
        try {
            const { jobPostingId } = req.params;

            // Kiểm tra xem công việc có tồn tại không
            const job = await JobPosting.findByPk(jobPostingId);
            if (!job) {
                return res.status(404).json({ message: 'Công việc không tồn tại.' });
            }

            // Lấy danh sách ứng viên đã ứng tuyển vào công việc
            const applications = await Application.findAll({
                where: { jobPostingId },
                include: [
                    {
                        model: CV, 
                        include: [
                            {
                                model: User,
                                attributes: ['id', 'name'],
                            }
                        ]
                    },
                ],
            });

            return res.status(200).json({
                message: 'Danh sách ứng viên cho công việc.',
                data: applications,
            });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách ứng viên:', error);
            return res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách ứng viên.' });
        }
    },

    // Cập nhật trạng thái ứng tuyển
    async updateApplicationStatus(req, res) {
        try {
            const { applicationId } = req.params;
            const { status } = req.body;

            // Kiểm tra xem ứng tuyển có tồn tại không
            const application = await Application.findByPk(applicationId);
            if (!application) {
                return res.status(404).json({ message: 'Ứng tuyển không tồn tại.' });
            }

            // Kiểm tra trạng thái hợp lệ
            if (!['pending', 'accepted', 'rejected'].includes(status)) {
                return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
            }

            // Cập nhật trạng thái ứng tuyển
            application.status = status;
            await application.save();

            return res.status(200).json({
                message: 'Trạng thái ứng tuyển đã được cập nhật.',
                data: application,
            });
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái ứng tuyển:', error);
            return res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật trạng thái ứng tuyển.' });
        }
    },

    // Phê duyệt đơn ứng tuyển
    async approveApplication(req, res) {
        try {
            const { applicationId } = req.params;

            // Kiểm tra xem ứng tuyển có tồn tại không
            const application = await Application.findByPk(applicationId);
            if (!application) {
                return res.status(404).json({ message: 'Ứng tuyển không tồn tại.' });
            }

            // Kiểm tra xem trạng thái có hợp lệ để phê duyệt không
            if (application.status !== 'pending') {
                return res.status(400).json({ message: 'Ứng tuyển phải ở trạng thái "pending" để phê duyệt.' });
            }

            
            application.status = 'accepted';
            await application.save();

            return res.status(200).json({
                message: 'Đơn ứng tuyển đã được phê duyệt.',
                data: application,
            });
        } catch (error) {
            console.error('Lỗi khi phê duyệt đơn ứng tuyển:', error);
            return res.status(500).json({ message: 'Đã xảy ra lỗi khi phê duyệt đơn ứng tuyển.' });
        }
    },


};

module.exports = ApplicationManagementController;



