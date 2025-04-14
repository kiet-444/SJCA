const express = require('express');
const router = express.Router();
const JobManagement = require('../controllers/JobManagement.controller');
const { verifyToken, isEmployer, isWorkerOrEmployer, isAdmin } = require('../middleware/auth.middleware');

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
 *  /jobs/jobPostingsIsPaid:
 *    get:
 *      summary: Lấy danh sách cong viec cơ bản
 *      tags: [Job]
 *      responses:
 *        200:
 *          description: Danh sách cong viec cơ bản
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                  data:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/Job'
 * */
router.get('/jobPostingsIsPaid', JobManagement.getJobPostingsByJobGroupsIsPaid);

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Lấy danh sách cong viec cơ bản
 *     tags: [Job]
 *     responses:
 *       200:
 *         description: Danh sách cong viec cơ bản
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
router.get('/jobPostings', JobManagement.getJobPostings);

/**
 * @swagger
 * /jobs/jobTypes:
 *   get:
 *     summary: Lấy danh sách loại cong viec
 *     tags: [Job]
 *     responses:
 *       200:
 *         description: Danh sách loại cong viec
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
 *                     $ref: '#/components/schemas/JobType'
 */
router.get('/jobType/:id', JobManagement.getJobTypeById);

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
router.get('/', JobManagement.getAllJobs);

/**
 * @swagger
 * /jobs/job-groups/{jobGroupId}:
 *   get:
 *     summary: Lấy danh sách công việc theo Job Group ID
 *     tags: [Job]
 *     parameters:
 *       - in: path
 *         name: jobGroupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của Job Group
 *     responses:
 *       200:
 *         description: Danh sách công việc thuộc Job Group
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
 *       404:
 *         description: Không tìm thấy Job Group
 *       500:
 *         description: Đã xảy ra lỗi
 */
router.get('/job-groups/:jobGroupId', JobManagement.getJobByJobGroupId);

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
router.get('/:id', JobManagement.getJobById);

/**
 * @swagger
 * /jobs/totalJob:
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
 * */
router.get('/totalJob', verifyToken, isAdmin, JobManagement.getAllJobByAdmin);

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
router.post('/jobType', verifyToken, isEmployer, JobManagement.createJobType);

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
router.post('/', verifyToken, isEmployer, JobManagement.createJob);



module.exports = router;