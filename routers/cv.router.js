const express = require('express');
const router = express.Router();
const CVManagementController = require('../controllers/CVManagement.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Tạo CV mới
/**
 * @swagger
 * /cvs:
 *   post:
 *     summary: Tạo CV mới
 *     tags: [CV]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               experience_year:
 *                 type: number
 *                 description: Thông số kinh nghiệm (năm)
 *     responses:
 *       201:
 *         description: CV mới tạo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/CV'
 *       500:
 *         description: Lỗi tạo CV
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/CV'
 *     security:
 *       - bearerAuth: []
 */
router.post('/cvs', verifyToken, CVManagementController.createCV);


// Lấy danh sách CV của người dùng
/**
 * @swagger
 * /cvs/user/{userId}:
 *   get:
 *     summary: Lấy danh sách CV của người dùng
 *     tags: [CV]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng
 *     responses:
 *       200:
 *         description: Danh sách CV của người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CV'
 *       500:
 *         description: Lỗi lấy danh sách CV
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CV'
 *     security:
 *       - bearerAuth: []
 */
router.get('/cvs/user/:userId', verifyToken, CVManagementController.getUserCVs);

// Gửi CV ứng tuyển công việc
/**
 * @swagger
 * /applications/job/{jobId}:
 *   post:
 *     summary: Gửi CV ứng tuyển công việc
 *     tags: [Application]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID cơ vị cơ bản
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cvId:
 *                 type: string
 *                 description: ID CV
 *     responses:
 *       201:
 *         description: Ứng tuyển công việc
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Application'
 *       500:
 *         description: Lỗi ứng tuyển
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Application'
 *     security:
 *       - bearerAuth: []
 */
router.post('/applications', verifyToken, CVManagementController.applyForJob);

module.exports = router;