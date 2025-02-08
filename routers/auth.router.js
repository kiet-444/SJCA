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
 *         - username
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the user
 *         username:
 *           type: string
 *           description: The username of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         password:
 *           type: string
 *           description: The hashed password of the user
 *         address:
 *           type: string
 *           description: The address of the user
 *         phoneNumber:
 *           type: string
 *           description: The phone number of the user
 *         role:
 *           type: string
 *           enum:
 *             - user
 *             - admin
 *           description: The role of the user (either 'user' or 'admin')
 *           default: user
 *         firstLogin:
 *           type: boolean
 *           description: Indicates if it's the admin's first login (applies only to admin)
 *       example:
 *         id: 60f6c2e2c4a1a72a344f321b
 *         username: johndoe
 *         email: johndoe@example.com
 *         password: $2a$10$7R6DhJ6zEJp2c.fXeq6gXe5DLJj.dZz.GO0Vuj1Q5jdpITGzyo3GG
 *         address: 123 Main St
 *         phoneNumber: 123456789
 *         role: user
 *         firstLogin: false
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - address
 *               - phoneNumber
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email of the user
 *               password:
 *                 type: string
 *                 description: The password of the user
 *               address:
 *                 type: string
 *                 description: The address of the user
 *               phoneNumber:
 *                 type: string
 *                 description: The phone number of the user
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or user already exists
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: The username or email of the user
 *               password:
 *                 type: string
 *                 description: The password of the user
 *             example:
 *               identifier: johndoe@example.com
 *               password: strongpassword123
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid username/email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     summary: Verify user email
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification token
 *     responses:
 *       200:
 *         description: User email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 error_code:
 *                   type: number
 *                   description: Error code
 *                   example: 0
 *       400:
 *         description: Invalid or expired verification token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
router.get('/verify-email', AuthController.verifyEmail);



/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Google OAuth2 login
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth2 login page
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 */

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth2 callback
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 */
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        const {  token } = req.user;

        res.json({ message: 'Login successful',  token });
    }
);


module.exports = router;
