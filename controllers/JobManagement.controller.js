const JobType = require('../models/JobType');
const Job = require('../models/Job');

const createJobType = async ( req, res) => {
    try {
        const { name, description, status } = req.body;

        const newJobType = await JobType.create({
            name,
            description: description || null,
            status: status || 'active',
        });

        return res.status(201).json({
            message: 'JobType đã được tạo thành công.',
            data: newJobType,
        });
    } catch (error) {
        console.error('Lỗi khi tạo JobType:', error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo JobType.' });
    }
};

const createJob = async (req, res) => {
    try {
        const { title, content, salary, expired_date, job_type_id } = req.body;

        if (!title || !content || !expired_date || !job_type_id) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin.' });
        }

        const newJob = await Job.create({
            title,
            content,
            salary,
            expired_date,
            job_type_id,
        });

        return res.status(201).json({
            message: 'Job đã được tạo thành công.',
            data: newJob,
        });
    } catch (error) {
        console.error('Lỗi khi tạo Job:', error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo Job.' });
    }
}
const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.findAll();
        return res.status(200).json({
            message: 'Danh sách công việc đã được lấy thành công.',
            data: jobs,
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách công việc:', error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách công việc.' });
    }
};

const getJobById = async (req,res) => {
    try {
        const { id } = req.params;
        const job = await Job.findOne({
            where: {id},
            include: [
                {
                    model: JobType
                }
            ]
        });
        if (!job) {
            return res.status(404).json({ message: 'Không tìm thấy công việc.' });
        }

        return res.status(200).json({
            message: 'Thông tin công việc đã được lấy thành công.',
            data: job,
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin công việc:', error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy thông tin công việc.' });
    }
}

module.exports = {createJobType, createJob, getAllJobs, getJobById}


