const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/Auth.controller');
const passport = require('../config/passport');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: ID tự động sinh của người dùng
 *         companyName:
 *           type: string
 *           description: Tên công ty của người dùng (chỉ với employer)
 *         fullName:
 *           type: string
 *           description: Họ tên đầy đủ của người dùng
 *         email:
 *           type: string
 *           description: Email của người dùng
 *         password:
 *           type: string
 *           description: Mật khẩu (đã được mã hóa)
 *         address:
 *           type: string
 *           description: Địa chỉ người dùng
 *         phoneNumber:
 *           type: string
 *           description: Số điện thoại
 *         role:
 *           type: string
 *           enum:
 *             - user
 *             - admin
 *           description: Vai trò của người dùng
 *         firstLogin:
 *           type: boolean
 *           description: Đăng nhập lần đầu (chỉ áp dụng với admin)
 *       example:
 *         id: 60f6c2e2c4a1a72a344f321b
 *         fullName: Nguyễn Văn A
 *         email: user@example.com
 *         password: hashed_password_here
 *         address: 123 Đường ABC, Hà Nội
 *         phoneNumber: "0123456789"
 *         role: user
 *         firstLogin: false
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - fullName
 *               - password
 *               - address
 *               - phoneNumber
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Họ tên người dùng
 *               companyName:
 *                 type: string
 *                 description: Tên công ty (chỉ áp dụng với nhà tuyển dụng)
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               address:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc email đã tồn tại
 *       500:
 *         description: Lỗi máy chủ
 */
router.post('/register', AuthController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập tài khoản
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email
 *               password:
 *                 type: string
 *                 description: Mật khẩu
 *             example:
 *               email: user@example.com
 *               password: strongpassword123
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Sai email hoặc mật khẩu
 *       500:
 *         description: Lỗi máy chủ
 */
router.post('/login', AuthController.login);

/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     summary: Xác thực email người dùng
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Mã token xác thực email
 *     responses:
 *       200:
 *         description: Xác thực email thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error_code:
 *                   type: number
 *                   example: 0
 *       400:
 *         description: Token không hợp lệ hoặc đã hết hạn
 */
router.get('/verify-email', AuthController.verifyEmail);

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Đăng nhập bằng Google OAuth2
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Chuyển hướng đến trang đăng nhập Google
 */
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Callback đăng nhập Google
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Đăng nhập Google thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 */
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        const { token } = req.user;
        res.json({ message: 'Login successful', token });
    }
);

module.exports = router;
