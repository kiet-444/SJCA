const express = require('express');
const router = express.Router();
const ApplicationManagementController = require('../controllers/ApplicationManagement.controller');
const { verifyToken, isEmployer, isAdmin, isWorker } = require('../middleware/auth.middleware');


/**
 * @swagger
 * /applications/job/{jobPostingId}:
 *   get:
 *     summary: Lấy danh sách ứng viên cho công việc
 *     tags: [Application]
 *     parameters:
 *       - in: path
 *         name: jobPostingId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID công việc
 *     responses:
 *       200:
 *         description: Danh sách ứng viên cho công việc
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
 *                     $ref: '#/components/schemas/Application'
 *       404:
 *         description: Công việc không tồn tại
 *       500:
 *         description: Đã xảy ra lỗi
 *     security:
 *       - bearerAuth: []
 */
router.get('/job/:jobPostingId', verifyToken, isEmployer, ApplicationManagementController.getApplicationsForJob);


/**
 * @swagger
 * /applications/{applicationId}/status:
 *   put:
 *     summary: Cập nhật trạng thái ứng tuyển
 *     tags: [Application]
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID ứng tuyển
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [submitted, viewed, interview_schedule_sent, processing, approved, rejected]
 *                 description: Trạng thái ứng tuyển
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Application'
 *       400:
 *         description: Trạng thái ứng tuyển không hợp lệ
 *       404:
 *         description: Ứng tuyển không tồn tại
 *       500:
 *         description: Đã xảy ra lỗi
 *     security:
 *       - bearerAuth: []
 */
router.put('/:applicationId/status', verifyToken, isEmployer, ApplicationManagementController.updateApplicationStatus);


/**
 * @swagger
 * /applications/user:
 *   get:
 *     summary: Lấy danh sách ứng tuyển của người dùng
 *     tags: [Application]
 *     responses:
 *       200:
 *         description: Danh sách ứng tuyển theo người dùng
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
 *                     $ref: '#/components/schemas/Application'
 *       500:
 *         description: Đã xảy ra lỗi
 *     security:
 *       - bearerAuth: []
 */
router.get('/user', verifyToken, isWorker, ApplicationManagementController.getApplicationsByUserId);

module.exports = router;
