const { Application, 
        CV, 
        User, 
        JobPosting } = require('../models');
const { JobGroup } = require('../models');


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
                                attributes: ['id', 'fullName', 'email'],
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
            const validStatuses = ['submitted', 'viewed', 'interview schedule sent', 'processing', 'approved', 'rejected'];
            if(!validStatuses.includes(status)) {
                return res.status(400).json({ message: 'The status not valid' });
            }
            // Kiểm tra xem ứng tuyển có tồn tại không
            const application = await Application.findByPk(applicationId);
            if (!application) {
                return res.status(404).json({ message: 'The application not found' });
            }
            // Cập nhật trạng thái ứng tuyển
            application.status = status;
            await application.save();

            return res.status(200).json({
                message: 'Updated application status successfully.',
                data: application,
            });
        } catch (error) {

            // console.error('Wrong when update application status:', error);

            return res.status(500).json({ message: 'Wrong when update application status' });
        }
    },

    // Phê duyệt đơn ứng tuyển
    async approveApplication(req, res) {
        try {
          const { applicationId } = req.params;
    
          // Kiểm tra xem ứng tuyển có tồn tại không
          const application = await Application.findByPk(applicationId);
          if (!application) {
            return res.status(404).json({ message: 'Application not found.' });
          }
    
          // Lấy thông tin công việc và kiểm tra số lượng đã được phê duyệt
          const job = await JobPosting.findByPk(application.jobPostingId);
          const approvedCount = await Application.count({
            where: { jobPostingId: application.jobPostingId, status: 'approved' },
          });
    
          if (approvedCount >= job.job.number_of_person) {
            return res.status(400).json({ message: 'The job has reached the maximum number of applicants.' });
          }
    
          // Cập nhật trạng thái của ứng tuyển thành 'approved'
          application.status = 'approved';
          await application.save();
    
          // Kiểm tra lại nếu số lượng đã đủ và từ chối các đơn còn lại
          const newApprovedCount = await Application.count({
            where: { jobPostingId: application.jobPostingId, status: 'approved' },
          });
    
          if (newApprovedCount >= job.number_of_person) {
            await Application.update(
              { status: 'rejected' },
              { where: {
                jobPostingId: application.jobPostingId,
                status: ['submitted', 'viewed', 'interview schedule sent', 'processing', 'rejected'],
            }}
            );
          }
    
          return res.status(200).json({ message: 'The application has been approved.', data: application });
        } catch (error) {
          console.error('Wrong when approve application:', error);
          return res.status(500).json({ message: 'Wrong when approve application' });
        }
      },

    // get applications by userId
    async getApplicationsByUserId(req, res) {
        try {
            const userId = req.userId;


            const cvs = await CV.findAll({
                where: { userId },
                attributes: ['id']
            })


            const applications = await Application.findAll({
                where: {
                    cvId: {
                        [Op.in]: cvs.map(cv => cv.id) // Lọc các application có cvId nằm trong mảng cvs
                    }
                },
                include: [
                    {
                        model: JobPosting,
                        attributes: ['id', 'location', 'salary', 'title'],
                        include: [
                            {
                                model: User,  
                                attributes: ['id', 'avatar']  
                            },
                            {
                                model: JobGroup,
                                attributes: ['id', 'status', 'updatedAt']
                            }
                        ]
                    }
                ]
            });
   
            return res.status(200).json({
                message: 'List of applications is retrieved successfully.',
                data: applications,
            });
        } catch (error) {
            console.error('Wrong when get list of applications:', error);
            return res.status(500).json({ message: 'Wrong when get list of applications' });
        }
    },

      
};

module.exports = ApplicationManagementController;



