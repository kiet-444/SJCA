// routes/user.routes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/User.controller');
const { verifyToken, isUser, isEmployer   } = require('../middleware/auth.middleware');


/**
 * swagger
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - fullname
 *         - email
 *         - password
 *         - address
 *         - phoneNumber
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the user
 *         username:
 *           type: string
 *           description: The username of the user  
 *         fullname:
 *           type: string
 *           description: The fullname of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *         address:
 *           type: string
 *           description: The address of the user
 *         phoneNumber:
 *           type: string
 *           description: The phone number of the user
 */








// Update user profile (accessible by user or admin)
/**
* @swagger
* /api/user/update/{id}:
*   put:
*     summary: Update user profile
*     tags: [User]
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: The ID of the user
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/User'
*     responses:
*       200:
*         description: User profile updated successfully
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/User'
*       404:
*         description: User not found
*       500:
*         description: Failed to update user profile
*/
router.put('/update', verifyToken, isUser , isEmployer  , UserController.updateUser);


// Delete user (admin only)
/**
* @swagger
* /api/user/delete/{id}:
*   delete:
*     summary: Delete a user
*     tags: [User]
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: The ID of the user to delete
*     responses:
*       200:
*         description: User deleted successfully
*       404:
*         description: User not found
*       500:
*         description: Failed to delete user
*/
router.delete('/delete/:id', verifyToken, isUser, isEmployer,  UserController.deleteUser);


// Get all users (admin only)
/**
 * @swagger
 * /api/user/all:
 *   get:
 *     summary: Get all users
 *     tags: [User]
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Failed to retrieve users
 */
router.get('/all', verifyToken, isEmployer, isUser, UserController.getAllUsers);


// Get user by ID (user or admin)
/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to retrieve
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to retrieve user
 */
router.get('/:id', verifyToken, UserController.getUserById);

/**
 * @swagger
 * /api/user/companies:
 *   get:
 *     summary: Get a list of companies
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter companies by name (case-insensitive, partial match)
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 5
 *         required: false
 *         description: Filter companies by minimum average rating (0 - 5)
 *     responses:
 *       200:
 *         description: List of companies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Company'
 *       404:
 *         description: No companies found
 *       500:
 *         description: Failed to retrieve companies
 */
router.get('/companies', UserController.getListCompany);



/**
 * @swagger
 * /api/user/companies/maxRating:
 *   get:
 *     summary: Get a list of companies with the highest rating
 *     tags: [User]
 *     responses:
 *       200:
 *         description: List of companies with the highest rating
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Company'
 *       500:
 *         description: Failed to retrieve companies
 */
router.get('/companies/maxRating', UserController.getCompanyByRating);


module.exports = router;
