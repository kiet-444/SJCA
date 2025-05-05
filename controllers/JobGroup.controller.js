const { Op } = require('sequelize');
const JobGroup = require('../models/JobGroup');
const JobPosting = require('../models/JobPosting');
const JobExecute = require('../models/JobExecute');
const Application = require('../models/Application');


const getAllJobGroups = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        let whereCondition = { status: 'active' };

        // Nếu có truyền start_date và end_date → lọc theo khoảng ngày
        if (start_date && end_date) {
            whereCondition.start_date = { [Op.between]: [new Date(start_date), new Date(end_date)] };
        }

        // Lấy danh sách jobGroups theo điều kiện lọc (hoặc lấy tất cả nếu không có query)
        const jobGroups = await JobGroup.findAll({
            where: whereCondition,
            include: [
                {
                    model: JobPosting,
                    attributes: ['id', 'title', 'description', 'salary', 'location'],
                },
            ],
            order: [['start_date', 'ASC']],
        });

        // Tổng số job active
        const totalJob = await JobGroup.count({ where: { status: 'active' } });

        // Tổng số job active hôm nay
        const totalJobToday = await JobGroup.count({
            where: {
                status: 'active',
                start_date: { [Op.between]: [startOfDay, endOfDay] },
            },
        });

        res.status(200).json({ totalJob, totalJobToday, data: jobGroups });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get job groups', error });
    }
};

const getAllJobGroupsInactive = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));


        let whereCondition = { status: 'inactive' };

        if (start_date && end_date) {
            whereCondition.start_date = { [Op.between]: [new Date(start_date), new Date(end_date)] };
        }

        const jobGroups = await JobGroup.findAll({
            where: whereCondition,
            include: [
                {
                    model: JobPosting,
                    attributes: ['id', 'title', 'description', 'salary', 'location'],
                },
            ],
            order: [['start_date', 'ASC']],
        });

        const totalJob = await JobGroup.count({ where: { status: 'inactive' } });

        const totalJobToday = await JobGroup.count({
            where: {
                status: 'inactive',
                start_date: { [Op.between]: [startOfDay, endOfDay] },
            },
        });


        res.status(200).json({ totalJob, totalJobToday, data: jobGroups });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get inactive job groups', error });
    }
};


const getAllJobGroupsByUserId = async (req, res) => {
    try {
        const userId = req.userId;
        // Lấy danh sách jobGroups theo điều kiện lọc (hoặc lấy tất cả nếu không có query)
        const jobGroups = await JobGroup.findAll({
            where: {
                userId
            },
            order: [['createdAt', 'DESC']],
        });


        const jobGroupsWithTotalJobPostings = await Promise.all(jobGroups.map(async (jobGroup) => {
            const totalJobPostings = await JobPosting.count({
                where: { jobGroupId: jobGroup.id },
            });
            const newJobGroup = {
                ...jobGroup.dataValues,
                totalJobPostings
            }
            return newJobGroup;
        }));


        res.status(200).json({ data: jobGroupsWithTotalJobPostings });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get job groups', error });
    }
};

const getJobGroupById = async (req, res) => {
    try {
        const { id } = req.params;
        const jobGroup = await JobGroup.findByPk(id);


        if (!jobGroup) {
            return res.status(404).json({ message: 'JobGroup not found' });
        }


        const totalJobPosting = await JobPosting.count({ where: { jobGroupId: id } });
       
        res.status(200).json({ data: { ...jobGroup.dataValues, totalJobPosting } });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get job group', error });
    }
}


const creatJobGroup = async (req, res) => {
    try {
        const userId = req.userId;
        const { title, description, status, start_date, end_date } = req.body;
        const project = await JobGroup.create({
            title,
            description,
            status: status || 'inactive',
            userId,
            start_date,
            end_date
        });
        res.status(201).json({
            message: 'Project created successfully',
            data: project
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: error.message });
    }
};

const updateStatusJobGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;


        const jobGroup = await JobGroup.findByPk(id);
        if (!jobGroup) {
            return res.status(404).json({ message: 'JobGroup not found' });
        }


        // Nếu chuyển sang "completed", phải kiểm tra job hoàn thành
        if (status === "completed") {
            const jobPostings = await JobPosting.findAll({ where: { jobGroupId: id } });


            if (jobPostings.length === 0) {
                return res.status(400).json({ message: "No JobPosting in this group" });
            }

            const allCompleted = jobPostings.every(job => job.status === "completed");  

            if (!allCompleted) {
                await JobPosting.update(
                    { status: "completed" },
                    { where: { jobGroupId: id } }
                );
            }
        }


        const end_date = new Date(jobGroup.end_date);
        const today = new Date();


        end_date.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);


        if (end_date.getTime() < today.getTime()) {
            await jobGroup.update({ status: "completed" });
            return res.status(400).json({ message: "JobGroup has expired and was set to completed automatically." });
        }


        // Nếu chuyển sang "active", phải kiểm tra đã thanh toán + có job
        if (status === "active") {
            if (!jobGroup.isPaid) {
                return res.status(400).json({ message: "JobGroup is not payment" });
            }


            const jobPostings = await JobPosting.findAll({
                where: { jobGroupId: id },
                attributes: ['id', 'salary']
            });


            if (jobPostings.length === 0) {
                return res.status(400).json({ message: "JobGroup enough job posting" });
            }


            const totalAmount = jobPostings.reduce((sum, job) => sum + job.salary, 0);
            if (totalAmount <= 0) {
                return res.status(400).json({ message: "No valid salary in JobGroup" });
            }


            const jobPostingIds = jobPostings.map(job => job.id);


            // Bắt >= 1 work in job posting
            // for (const jobPostingId of jobPostingIds) {
            //     const assignedCount = await JobExecute.count({
            //         where: {
            //             jobPostingId,
            //             userId: { [Op.ne]: null }
            //         }
            //     });


            //     console.log(`JobPosting ${jobPostingId} has ${assignedCount} assigned workers`);


            //     if (assignedCount === 0) {
            //         return res.status(400).json({
            //             message: `JobPosting ${jobPostingId} does not have any assigned workers.`
            //         });
            //     }
            // }
            // Bắt >= 1 work in job posting
            const jobExecutes = await JobExecute.findAll({
                where: {
                    jobPostingId: { [Op.in]: jobPostingIds },
                    status: 'active'
                }
            });


            const listWorker = await Application.findAll({
                where: {
                    jobPostingId: { [Op.in]: jobPostingIds },
                    status: 'approved'
                },
                attributes: ['jobPostingId'],
                include: [{
                    model: CV,
                    attributes: ['userId']
                }]
            })


            const newJobExecutes = [];


            for (const jobExe of jobExecutes) {
                const matched = listWorker
                    .filter(worker => worker.jobPostingId === jobExe.jobPostingId)
                    .map(worker => ({
                        jobPostingId: jobExe.jobPostingId,
                        userId: worker.CV.userId,
                        status: 'active',
                        processComplete: 0,
                        assigned_at: jobExe.assigned_at,
                        note: jobExe.note,
                        work_process: jobExe.work_process,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }));


                newJobExecutes.push(...matched);
            }


            // Kiểm tra trước khi insert
            if (newJobExecutes.length > 0) {
                await JobExecute.bulkCreate(newJobExecutes);
            }
            // Nếu mọi điều kiện đều OK, update JobExecute
            // await JobExecute.update(
            //     {
            //         status: "active",
            //         note: "send when update JobGroup",
            //         sent_at: new Date()
            //     },
            //     {
            //         where: {
            //             jobPostingId: { [Op.in]: jobPostingIds },
            //             status: { [Op.ne]: "active" }
            //         }  
            //     }
            // );
            // for (const jobPostingId of jobPostingIds) {
            //     const jobExecutes = await JobExecute.findAll({
            //       where: {
            //         jobPostingId,
            //         status: { [Op.ne]: "active" }
            //       }
            //     });


            //     await Promise.all(jobExecutes.map(jobExecute =>
            //       jobExecute.update({
            //         status: "active",
            //         note: "send when update JobGroup",
            //         sent_at: new Date()
            //       })
            //     ));
            //   }


            // for (const jobPostingId of jobPostingIds) {
            //     const assignedWorkers = await JobExecute.findAll({
            //         where: { jobPostingId, status: 'active' },
            //         attributes: ['userId']
            //     });


            //     if (assignedWorkers.length === 0) {
            //         return res.status(400).json({ message: `No active workers assigned to JobPosting ${jobPostingId}` });
            //     }


            //     const newJobExecutes = assignedWorkers.map(worker => ({
            //         userId: worker.userId,
            //         jobPostingId: jobPostingId,
            //         status: 'active',
            //         note: 'Cloned from template when JobGroup started',
            //         sent_at: new Date()
            //     }));


            //     await JobExecute.bulkCreate(newJobExecutes);
            // }
        }


        await jobGroup.update({ status });


        res.status(200).json({ message: 'JobGroup status updated successfully', data: jobGroup });
    } catch (error) {
        console.error('Error updating jobGroup status:', error);
        res.status(500).json({ error: error.message });
    }
};




module.exports = { creatJobGroup, updateStatusJobGroup, getAllJobGroups, getAllJobGroupsInactive, getAllJobGroupsByUserId, getJobGroupById };