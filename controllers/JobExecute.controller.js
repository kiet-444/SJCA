const { JobExecute } = require('../models');
const { Op } = require('sequelize');

const JobExecuteController = {
    async createJobExecute(req, res) {
        try {
            const { jobPostingId, userId, assigned_at, checkin_at, checkout_at, status, note, work_process } = req.body;
            
            const jobExecute = await JobExecute.create({ jobPostingId, userId, assigned_at, checkin_at, checkout_at, status, note, work_process });
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
            const userId = req.userId;
            const { jobPostingId } = req.params;

            if (!jobPostingId){
                return res.status(400).json({ message: 'JobPostingId is required' });
            }

            const jobExecutes = await JobExecute.findAll({
                where: {
                    jobPostingId,
                    userId
                }
            });
            
            if(!jobExecutes || jobExecutes.length === 0) {
                return res.status(404).json({ message: 'Job execute not found' });
            } 

            res.status(200).json({ message: 'Get Job Execute successfully', data: jobExecutes });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },


    async updateJobExecute(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            
            const jobExecute = await JobExecute.findByPk(id);
            if (!jobExecute) {
                return res.status(404).json({ message: 'Job execute not found' });
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