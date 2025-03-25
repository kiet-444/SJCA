const { JobType, JobPosting} = require('../models');

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
        const userId = req.userId;

        const {title, description, address,
                 location, number_of_person, payment_type, gender_requirement, min_star_requirement, 
                 min_job_requirement, status, expired_date,
                 working_time, started_date, end_date,
                 salary, jobTypeId, jobGroupId } = req.body;
        
        
        const newJob = await JobPosting.create({
            title,
            description,
            address,
            location,
            number_of_person,
            payment_type,
            gender_requirement,
            min_star_requirement,
            min_job_requirement,
            status,
            expired_date,
            working_time,
            started_date,
            end_date,
            salary,
            userId,
            jobTypeId,
            jobGroupId
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

const getJobPostings = async (req, res) => {
    try {
        const { title, location, min_salary, max_salary, expired_date } = req.query;

        let whereCondition = {};

        if (title) {
            whereCondition.title = { [Op.iLike]: `%${title}%` }; // Tìm kiếm tiêu đề chứa từ khóa
        }

        if (location) {
            whereCondition.location = location; // Lọc theo địa điểm
        }

        if (min_salary && max_salary) {
            whereCondition.salary = { [Op.between]: [parseFloat(min_salary), parseFloat(max_salary)] };
        } else if (min_salary) {
            whereCondition.salary = { [Op.gte]: parseFloat(min_salary) };
        } else if (max_salary) {
            whereCondition.salary = { [Op.lte]: parseFloat(max_salary) };
        }

        if (expired_date) {
            whereCondition.expired_date = { [Op.gte]: new Date(expired_date) }; // Lọc theo ngày hết hạn còn hiệu lực
        }

        const jobPostings = await JobPosting.findAll({
            where: whereCondition,
            attributes: [
                'id', 'title', 'description', 'location', 'salary', 'expired_date', 'status'
            ],
            order: [['expired_date', 'ASC']], // Sắp xếp theo ngày hết hạn tăng dần
        });

        res.status(200).json({ data: jobPostings });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách công việc', error });
    }
};


const getAllJobs = async (req, res) => {
    try {
        const jobs = await JobPosting.findAll();
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
        const job = await JobPosting.findOne({
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

module.exports = {createJobType, createJob, getAllJobs, getJobById, getJobPostings}


