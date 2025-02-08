const express = require('express');
const router = express.Router();
const CVManagementController = require('../controllers/CVManagement.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const multer = require('multer');

const storage = multer.memoryStorage(); 
const upload = multer({ storage });

/**
 * @swagger
 * /cvs:
 *   post:
 *     summary: Upload CV mới 
 *     tags: [CV]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               experience_year:
 *                 type: number
 *                 description: Số năm kinh nghiệm
 *     responses:
 *       201:
 *         description: CV được tạo thành công
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
 *     security:
 *       - bearerAuth: []
 */
router.post('/', verifyToken, upload.single('file'), CVManagementController.uploadCV);

// 📌 Lấy danh sách CV của người dùng
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
 *         description: ID của người dùng
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
 *     security:
 *       - bearerAuth: []
 */
router.get('/user/:userId', verifyToken, CVManagementController.getUserCVs);

// 📌 Lấy file CV từ database
/**
 * @swagger
 * /cvs/{cvId}/file:
 *   get:
 *     summary: Lấy file CV từ database
 *     tags: [CV]
 *     parameters:
 *       - in: path
 *         name: cvId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của CV
 *     responses:
 *       200:
 *         description: Trả về file CV
 *       404:
 *         description: Không tìm thấy CV
 *     security:
 *       - bearerAuth: []
 */
router.get('/:cvId/file', verifyToken, CVManagementController.getCVFile);

// 📌 Gửi CV ứng tuyển công việc
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
 *         description: ID của công việc
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cvId:
 *                 type: string
 *                 description: ID của CV
 *     responses:
 *       201:
 *         description: Ứng tuyển công việc thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       500:
 *         description: Lỗi ứng tuyển
 *     security:
 *       - bearerAuth: []
 */
router.post('/job/:jobId', verifyToken, CVManagementController.applyForJob);

module.exports = router;
