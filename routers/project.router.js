const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/Project.controller');
const { verifyToken, isEmployer } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Tạo project
 *     tags: [Project]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       500:
 *         description: Đã xảy ra lỗi
 */

router.post('/projects', verifyToken, isEmployer, ProjectController.createProject);