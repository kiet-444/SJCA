const { JobType, JobPosting, JobGroup } = require('../models');

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

        const { title, description, address,
            location, number_of_person, gender_requirement, min_star_requirement,
            status, started_date, end_date,
            salary, jobType, jobGroupId } = req.body;

        let newJobType = null;
        if (jobType) {
            newJobType = await JobType.create({
                name: jobType,
                description: null,
                status: 'active',
            })
        }

        const newJob = await JobPosting.create({
            title,
            description,
            address,
            location,
            number_of_person,
            gender_requirement,
            min_star_requirement,
            status,
            started_date,
            end_date,
            salary,
            userId,
            jobTypeId: newJobType? newJobType.id : null,
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
            order: [['expired_date', 'ASC']], 
        });

        res.status(200).json({ data: jobPostings });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách công việc', error });
    }
};

const getJobByJobGroupId = async (req,res) => {
    try {
        const { jobGroupId } = req.params;
        const jobs = await JobPosting.findAll({
            where: {jobGroupId},
            include: [
                {
                    model: JobType
                }
            ]
        });
        if (jobs.length === 0) {
            return res.status(404).json({ message: 'Cannot find job posting.' });
        }


        return res.status(200).json({
            message: 'Find job posting successfully.',
            data: jobs,
        });
    } catch (error) {
        console.error('Error when get job posting', error);
        return res.status(500).json({ message: 'Error when get job posting' });
    }
}



const getAllJobs = async (req, res) => { //lấy all job theo job group theo id cua job group
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

const getJobPostingsByJobGroupsIsPaid = async (req, res) => {
    try {
        const jobGroups = await JobGroup.findAll({
            where: {
                isPaid: true
            },
            attributes: ['id']
        })


        const jobPostings = await JobPosting.findAll({
            where: {
                jobGroupId: jobGroups.map(jobGroup => jobGroup.id)
            }
        })
        res.status(200).json({ data: jobPostings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getJobTypeById = async (req, res) => {
    try {
        const { id } = req.params;


        // Validate if the id is provided and is a valid number
        if (!id || isNaN(id)) {
            return res.status(400).json({ message: 'Invalid or missing job type ID.' });
        }


        const jobType = await JobType.findOne({
            where: { id: parseInt(id, 10) }
        });


        if (!jobType) {
            return res.status(404).json({ message: 'Job type not found.' });
        }


        return res.status(200).json({
            message: 'Job type information retrieved successfully.',
            data: jobType.toJSON(),
        });
    } catch (error) {
        console.error('Error retrieving job type information:', error);
        return res.status(500).json({ message: 'An error occurred while retrieving job type information.' });
    }
};


module.exports = {createJobType, createJob, getAllJobs, getJobById, getJobPostings, getJobByJobGroupId, getJobPostingsByJobGroupsIsPaid , getJobTypeById};


