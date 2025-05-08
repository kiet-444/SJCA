const express = require('express');
const router = express.Router();

const ReviewController = require('../controllers/Review.controller');


/**
 * @swagger
 * /api/reviews/create:
 *   post:
 *     summary: Tạo review
 *     tags: [Review]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Review'
 *     responses:
 *       200:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       500:
 *         description: Đã xảy ra lỗi
 */
router.post('/create', ReviewController.createReview);

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Lấy danh sách review
 *     tags: [Review]
 *     responses:
 *       200:
 *         description: Danh sách review
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
 *                     $ref: '#/components/schemas/Review'  
 */
router.get('/', verifyToken, ReviewController.getListRatings);

module.exports = router;