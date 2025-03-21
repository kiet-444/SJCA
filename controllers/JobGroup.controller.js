const JobGroup = require('../models/JobGroup');
const JobPosting = require('../models/JobPosting');
const creatJobGroup = async (req, res) => {
    try {
        const userId = req.userId;
        const { title, description, status } = req.body;
        const project = await JobGroup.create({
            title,
            description,
            status: status || 'inactive',
            userId
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

        if (status === "completed") {
            const jobPostings = await JobPosting.findAll({ where: { jobGroupId: id } });

            if (jobPostings.length === 0) {
                return res.status(400).json({ message: "Không có JobPosting nào trong nhóm này" });
            }

            const allCompleted = jobPostings.every(job => job.status === "completed");

            if (!allCompleted) {
                return res.status(400).json({ message: "Tất cả JobPosting phải ở trạng thái 'completed' trước khi cập nhật JobGroup" });
            }
        }

        await jobGroup.update({ status });

        res.status(200).json({ message: 'JobGroup status updated successfully', data: jobGroup });
    } catch (error) {
        console.error('Error updating jobGroup status:', error);
        res.status(500).json({ error: error.message });
    }
};


module.exports = { creatJobGroup, updateStatusJobGroup };