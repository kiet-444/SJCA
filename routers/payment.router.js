const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/Payment.controller");


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
router.post("/create", PaymentController.createPayment);

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
router.post("/release", PaymentController.releasePayment);

module.exports = router;
