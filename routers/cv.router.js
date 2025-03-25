const express = require('express');
const router = express.Router();
const CVManagementController = require('../controllers/CVManagement.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const multer = require('multer');

const storage = multer.memoryStorage(); 
const upload = multer({ storage });

// Upload CV
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
 *     responses:
 *       201:
 *         description: CV được tạo thành công
 *       500:
 *         description: Lỗi tạo CV
 *     security:
 *       - bearerAuth: []
 */
router.post('/', verifyToken, upload.single('file'), CVManagementController.uploadCV);

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
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Danh sách CV của người dùng
 *       500:
 *         description: Lỗi lấy danh sách CV
 *     security:
 *       - bearerAuth: []
 */
router.get('/user/:userId', verifyToken, CVManagementController.getUserCVs);

// Lấy file CV
// /**
//  * @swagger
//  * /cvs/{cvId}/file:
//  *   get:
//  *     summary: Lấy file CV từ database
//  *     tags: [CV]
//  *     parameters:
//  *       - in: path
//  *         name: cvId
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Trả về file CV
//  *       404:
//  *         description: Không tìm thấy CV
//  *     security:
//  *       - bearerAuth: []
//  */
// router.get('/:cvId/file', verifyToken, CVManagementController.getCVFile);

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cvId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ứng tuyển thành công
 *       400:
 *         description: Đã ứng tuyển trước đó
 *       404:
 *         description: Không tìm thấy công việc hoặc CV
 *     security:
 *       - bearerAuth: []
 */
router.post('/job/:jobId', verifyToken, CVManagementController.applyForJob);

// Xóa CV
/**
 * @swagger
 * /cvs/{cvId}:
 *   delete:
 *     summary: Xóa CV theo ID
 *     tags: [CV]
 *     parameters:
 *       - in: path
 *         name: cvId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CV đã được xóa thành công
 *       404:
 *         description: Không tìm thấy CV
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:cvId', verifyToken, CVManagementController.deleteCV);

// Đặt CV mặc định
/**
 * @swagger
 * /cvs/{cvId}/set-default:
 *   put:
 *     summary: Đặt CV làm CV mặc định
 *     tags: [CV]
 *     parameters:
 *       - in: path
 *         name: cvId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CV đã được đặt làm mặc định
 *       404:
 *         description: Không tìm thấy CV
 *     security:
 *       - bearerAuth: []
 */
router.put('/:cvId/set-default', verifyToken, CVManagementController.setDefaultCV);

// Lấy danh sách ứng tuyển từ CV
/**
 * @swagger
 * /cvs/{cvId}/applications:
 *   get:
 *     summary: Lấy danh sách công việc đã ứng tuyển bằng CV
 *     tags: [Application]
 *     parameters:
 *       - in: path
 *         name: cvId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách công việc ứng tuyển
 *       404:
 *         description: Không tìm thấy CV
 *     security:
 *       - bearerAuth: []
 */
router.get('/:cvId/applications', verifyToken, CVManagementController.getApplicationsByCV);

module.exports = router;
