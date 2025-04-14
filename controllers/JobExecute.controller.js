const { JobExecute } = require('../models');
const { Op } = require('sequelize');

const JobExecuteController = {
    async createJobExecute(req, res) {
        try {
            const { jobPostingId, userId, assigned_at, checkin_at, checkout_at, status, note, processComplete, work_process,
                   reason ,  } = req.body;
            
            const jobExecute = await JobExecute.create({ jobPostingId, userId, assigned_at, checkin_at, checkout_at, status, note, processComplete, work_process, reason });
            res.status(201).json({ message: 'Job execute sent successfully', jobExecute });
        } catch (error) {
            console.error('Error sending job execute:', error);
            res.status(500).json({ error: error.message });
        }
    },  

    async getDailyJobs(req, res) {
        try {
            const { userId } = req.params;
            const today = new Date().toISOString().split('T')[0];
            
            const jobs = await JobExecute.findAll({
                where: {
                    userId,
                    status: 'success',
                    createdAt: {
                        [Op.gte]: new Date(today + 'T00:00:00.000Z'),
                        [Op.lt]: new Date(today + 'T23:59:59.999Z')
                    }
                }
            });
            
            res.status(200).json({ message: 'Daily jobs fetched successfully', jobs });
        } catch (error) {
            console.error('Error fetching daily jobs:', error);
            res.status(500).json({ error: error.message });
        }
    },

    async getJobExecuteByJobPostingId(req, res) {
        try {
            const { jobPostingId } = req.params;
    
            if (!jobPostingId){
                return res.status(400).json({ message: 'JobPostingId is required' });
            }
    
            // Lấy tất cả job execute trong jobPostingId
            const jobExecutes = await JobExecute.findAll({
                where: {
                    jobPostingId
                }
            });
    
            // Nếu không có job execute nào trong job posting
            if(!jobExecutes || jobExecutes.length === 0) {
                return res.status(404).json({ message: 'No job execute found for this job posting' });
            }
    
            // Gửi tất cả job execute cho các user trong job posting
            res.status(200).json({ message: 'Job executes fetched successfully', data: jobExecutes });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    // async getJobExecuteById(req, res) {
    //     try {
    //         const { id } = req.params;
    //         const jobExecute = await JobExecute.findByPk(id);
    //         if (!jobExecute) {
    //             return res.status(404).json({ message: 'Job execute not found' });
    //         }
    //         res.status(200).json({ message: 'Job execute fetched successfully', jobExecute });
    //     } catch (error) {
    //         res.status(500).json({ error: error.message });
    //     }
    // },
    
    async updateJobExecute(req, res) {
        try {
            const { id } = req.params;
            let updates = req.body;
    
            const jobExecute = await JobExecute.findByPk(id);
            if (!jobExecute) {
                return res.status(404).json({ message: 'Job execute not found' });
            }
    
            // upload img
            if (req.files && req.files.length > 0) {
                const file = req.files[0];
                const { buffer, mimetype } = file;
                const bufferStream = new PassThrough();
                bufferStream.end(buffer);
    
                const resourceType = mimetype.startsWith('image') ? 'image' : 'raw';
    
                const uploadResult = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        { resource_type: resourceType },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    ).end(buffer);
                });
    
                updates.image = uploadResult.secure_url;
            }
    
            await jobExecute.update(updates);
            res.status(200).json({ message: 'Job execute updated successfully', jobExecute });
        } catch (error) {
            console.error('Error updating job execute:', error);
            res.status(500).json({ error: error.message });
        }
    },

    async deleteJobExecute(req, res) {
        try {
            const { id } = req.params;
            await JobExecute.destroy({
                where: {
                    id
                }
            });
            res.status(200).json({ message: 'Delete Job execute successfully'});
        } catch (error) {
            console.error('Error deleting job execute:', error);
            res.status(500).json({ error: error.message });
        }
    }

};

module.exports = JobExecuteController;