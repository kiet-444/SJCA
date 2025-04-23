const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/Payment.controller");
const { verifyToken, isAdmin, isWorkerOrEmployer } = require("../middleware/auth.middleware");


/**
 * @swagger
 * /payment/create:
 *   post:
 *     summary: Tạo payment
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Payment'
 *     responses:
 *       200:
 *         description: Payment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       500:
 *         description: Đã xảy ra lỗi
 */
router.post("/create", verifyToken, PaymentController.createPayment);

/**
 * @swagger
 * /payment/callback:
 *   post:
 *     summary: Xu ly payment
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Payment'
 *     responses:
 *       200:
 *         description: Payment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       500:
 *         description: Đã xảy ra lỗi
 */
router.post("/callback", PaymentController.paymentCallback);

/**
 * @swagger
 * /payment/release:
 *   post:
 *     summary: Phan phoi payment
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Payment'
 *     responses:
 *       200:
 *         description: Payment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       500:
 *         description: Đã xảy ra lỗi
 */
router.post("/release", verifyToken, PaymentController.releasePayment);

/**
 * @swagger
 * /payment/paymentHistory:
 *   get:
 *     summary: Lý liệu payment
 *     tags: [Payment]
 *     responses:
 *       200:
 *         description: Payment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       500:
 *         description: Đã xảy ra lỗi
 */
router.get("/paymentHistory", verifyToken, isWorkerOrEmployer, PaymentController.paymentHistory);

/**
 * @swagger
 * /payment/escrowWallet:
 *   post:
 *     summary: Lý liệu payment
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Payment'
 *     responses:
 *       200:
 *         description: Payment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       500:
 *         description: Đã xảy ra lỗi
 */
router.post("/escrowWallet", verifyToken, isWorkerOrEmployer, PaymentController.getEscrowWallet);

module.exports = router;
