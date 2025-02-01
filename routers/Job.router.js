const express = require('express');
const router = express.Router();
const JobManagement = require('../controllers/JobManagement.controller')
const  {verifyToken, isEmployer} = require('../middleware/auth.middleware')

/**
 * @swagger
 * component
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * schemas:
 *   Job:
 *     type: object
 *     properties:
 *       id:
 *         type: string
 *         description: ID cơ vị cơ bản
 *       title:
 *         type: string
 *         description: TitledBorder
 *       description:
 *         type: string
 *         description: Description
 *       jobType:
 *         type: string
 *         description: ID cơ vị cơ bản
 *       salary:
 *         type: number
 *         description: Salary
 *       expired_date:
 *         type: string
 *         description: ExpiredDate
 *       status:
 *         type: string
 *         description: Status
 *       createdAt:
 *         type: string
 *         description: CreatedAt
 *       updatedAt:
 *         type: string
 *         description: UpdatedAt
 *   JobType:
 *     type: object
 *     properties:
 *       id:
 *         type: string
 *         description: ID cơ vị cơ bản
 *       name:
 *         type: string
 *         description: TitledBorder
 *       description:
 *         type: string
 *         description: Description
 *       status:
          type: string
          enum: ["active", "inactive"]
 *       createdAt:
 *         type: string
 *         description: CreatedAt
 *       updatedAt:
 *         type: string
 *         description: UpdatedAt
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
 *     summary: Lấy cơ vị cơ bản
 *     tags: [Job]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID cơ vị cơ bản
 *     responses:
 *       200:
 *         description: Cơ vị cơ bản
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       404:
 *         description: Cơ vị cơ bản khôn tìm thấy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *         500:
 *           description: Đã xảy ra lỗi
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Job'
 */
router.get('/jobs/:id', verifyToken, isEmployer, JobManagement.getJobById);

/**
 * @swagger
 * /jobs/jobType:
 *   post:
 *     summary: Tạo cơ vị cơ bản
 *     tags: [Job]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobType'
 *     responses:
 *       200:
 *         description: Cơ vị cơ bản
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobType'
 *       500:
 *         description: Đã xảy ra lỗi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobType'
 * 
 */
router.post('/jobs/jobType', verifyToken, isEmployer, JobManagement.createJobType);

/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: Tạo công việc cơ bản
 *     tags: [Job]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Job'
 *     responses:
 *       200:
 *         description: Cơ vị cơ bản
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       500:
 *         description: Đã xảy ra lỗi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 */

router.post('/jobs', verifyToken, isEmployer, JobManagement.createJob);


module.exports = router;