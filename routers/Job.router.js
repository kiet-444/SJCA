const express = require('express');
const router = express.Router();
const JobManagement = require('../controllers/JobManagement.controller');
const { verifyToken, isEmployer } = require('../middleware/auth.middleware');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Job:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID công việc
 *         title:
 *           type: string
 *           description: Tiêu đề công việc
 *         description:
 *           type: string
 *           description: Mô tả công việc
 *         jobType:
 *           type: string
 *           description: Loại công việc
 *         salary:
 *           type: number
 *           description: Mức lương
 *         expired_date:
 *           type: string
 *           description: Ngày hết hạn
 *         status:
 *           type: string
 *           description: Trạng thái công việc
 *         createdAt:
 *           type: string
 *           description: Ngày tạo
 *         updatedAt:
 *           type: string
 *           description: Ngày cập nhật
 *     JobType:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID loại công việc
 *         name:
 *           type: string
 *           description: Tên loại công việc
 *         description:
 *           type: string
 *           description: Mô tả loại công việc
 *         status:
 *           type: string
 *           enum: ["active", "inactive"]
 *           description: Trạng thái loại công việc
 *         createdAt:
 *           type: string
 *           description: Ngày tạo
 *         updatedAt:
 *           type: string
 *           description: Ngày cập nhật
 */

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Lấy danh sách công việc
 *     tags: [Job]
 *     responses:
 *       200:
 *         description: Danh sách công việc
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
 *                     $ref: '#/components/schemas/Job'
 */
router.get('/jobs', verifyToken, isEmployer, JobManagement.getAllJobs);

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     summary: Lấy thông tin công việc theo ID
 *     tags: [Job]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID công việc
 *     responses:
 *       200:
 *         description: Thông tin công việc
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       404:
 *         description: Công việc không tìm thấy
 *       500:
 *         description: Đã xảy ra lỗi
 */
router.get('/jobs/:id', verifyToken, isEmployer, JobManagement.getJobById);

/**
 * @swagger
 * /jobs/jobType:
 *   post:
 *     summary: Tạo loại công việc
 *     tags: [Job]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobType'
 *     responses:
 *       200:
 *         description: Loại công việc được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobType'
 *       500:
 *         description: Đã xảy ra lỗi
 */
router.post('/jobs/jobType', verifyToken, isEmployer, JobManagement.createJobType);

/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: Tạo công việc mới
 *     tags: [Job]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Job'
 *     responses:
 *       200:
 *         description: Công việc được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       500:
 *         description: Đã xảy ra lỗi
 */
router.post('/jobs', verifyToken, isEmployer, JobManagement.createJob);

module.exports = router;