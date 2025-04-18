const express = require('express');
const router = express.Router();
const JobGroupController = require('../controllers/JobGroup.controller');
const { verifyToken, isEmployer } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/jobGroups:
 *   get:
 *     summary: Lấy danh sách Job Groups
 *     description: Lấy danh sách Job Groups có thể lọc theo ngày bắt đầu và ngày kết thúc.
 *     tags: [JobGroup]
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày bắt đầu (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày kết thúc (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Danh sách Job Groups
 *         content:
 *           application/json:
 *             schema:  
 *               type: object
 *               properties:
 *                 totalJob:
 *                   type: integer
 *                   description: Tổng số job
 *                 totalJobToday:
 *                   type: integer
 *                   description: Tổng số job hôm nay
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/JobGroup'
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     JobGroup:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *         start_date:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

router.get('/jobGroups', JobGroupController.getAllJobGroups);

/**
 * @swagger
 * /api/jobGroups/inactive:
 *   get:
 *     summary: Lấy danh sách Job Groups có trạng thái inactive
 *     tags: [JobGroup]
 *     responses:
 *       200:
 *         description: Danh sách Job Groups có trạng thái inactive
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobGroup'
 *       500:
 *         description: Lỗi server
 */


router.get('/jobGroupsInactive', JobGroupController.getAllJobGroupsInactive);


/**
 * @swagger
 * /api/jobGroups/:
 *   get:
 *     summary: Lấy danh sách Job Groups theo Employer
 *     tags: [JobGroup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách Job Groups của employer
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobGroup'
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */
router.get('/', verifyToken, isEmployer, JobGroupController.getAllJobGroupsByUserId);

/**
 * @swagger
 * /api/jobGroups/{id}:
 *   get:
 *     summary: Lấy JobGroup theo ID
 *     tags: [JobGroup]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID JobGroup
 *     responses:
 *       200:
 *         description: Thống tin JobGroup
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobGroup'
 *       404:
 *         description: JobGroup không tìm thấy
 *       500:
 *         description: Đã xảy ra lỗi
 */
router.get('/:id', JobGroupController.getJobGroupById);

/**
 * @swagger
 * /api/jobGroups:
 *   post:
 *     summary: Tạo JobGroup
 *     tags: [JobGroup]
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

router.post('/', verifyToken, isEmployer, JobGroupController.creatJobGroup);


/** 
 * @swagger
 * /api/jobGroups/{id}:
 *   get:
 *     summary: Lấy danh sách project
 *     tags: [JobGroup]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID project
 *     responses:
 *       200:
 *         description: Danh sách project
 *         content:
 *           application/json:
 *             schema:             
 *               $ref: '#/components/schemas/Project'
 */

router.post('/jobGroups/:id', verifyToken, isEmployer, JobGroupController.updateStatusJobGroup);

module.exports = router;