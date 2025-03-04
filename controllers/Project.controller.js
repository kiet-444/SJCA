const Project = require('../models/Project');

const createProject = async (req, res) => {
    try {
        const userId = req.userId;
        const { title, description, status } = req.body;
        const project = await Project.create({
            title,
            description,
            status: status || 'active',
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

module.exports = { createProject };