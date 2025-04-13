const express = require('express');
const router = express.Router();
const ComplaintController = require('../controllers/Complaint.controller');
const { verifyToken, isWorkerOrEmployer, isSupportStaff } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Complaint
 *   description: Complaint management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Complaint:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated ID of the complaint
 *         title:
 *           type: string
 *           description: Title of the complaint
 *         description:
 *           type: string
 *           description: Description of the complaint
 *         image:
 *           type: string
 *           description: URL of the uploaded image
 *         status:
 *           type: string
 *           enum: [pending, resolved, rejected]
 *           default: pending
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "6612fb2f9d2a7d3cc42e9b20"
 *         title: "Payment delay"
 *         description: "The employer has not released payment after job completion."
 *         status: "pending"
 *         createdAt: "2025-04-06T12:34:56Z"
 *         updatedAt: "2025-04-06T12:34:56Z"
 */

/**
 * @swagger
 * /complaints:
 *   post:
 *     summary: Create a new complaint
 *     tags: [Complaint]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Complaint'
 *     responses:
 *       201:
 *         description: Complaint created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Complaint'
 *       500:
 *         description: Failed to create complaint
 *     security:
 *       - bearerAuth: []
 */
router.post('/', verifyToken, ComplaintController.createComplaintRecord);

/**
 * @swagger
 * /complaints:
 *   get:
 *     summary: Get all complaints
 *     tags: [Complaint]
 *     responses:
 *       200:
 *         description: List of all complaints
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Complaint'
 *       500:
 *         description: Failed to retrieve complaints
 *     security:
 *       - bearerAuth: []
 */
router.get('/', verifyToken, isWorkerOrEmployer, ComplaintController.getAllComplaintRecords);

/**
 * @swagger
 * /complaints/{id}:
 *   get:
 *     summary: Get a complaint by ID
 *     tags: [Complaint]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the complaint
 *     responses:
 *       200:
 *         description: Complaint details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Complaint'
 *       404:
 *         description: Complaint not found
 *       500:
 *         description: Failed to retrieve complaint
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', verifyToken, ComplaintController.getComplaintRecordById);

/**
 * @swagger
 * /complaints/{id}:
 *   put:
 *     summary: Update a complaint
 *     tags: [Complaint]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the complaint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Complaint'
 *     responses:
 *       200:
 *         description: Complaint updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Complaint'
 *       404:
 *         description: Complaint not found
 *       500:
 *         description: Failed to update complaint
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', verifyToken, isSupportStaff,  ComplaintController.updateComplaintRecord);

/**
 * @swagger
 * /complaints/{id}:
 *   delete:
 *     summary: Delete a complaint
 *     tags: [Complaint]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the complaint
 *     responses:
 *       200:
 *         description: Complaint deleted successfully
 *       404:
 *         description: Complaint not found
 *       500:
 *         description: Failed to delete complaint
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', verifyToken, ComplaintController.deleteComplaintRecord);

module.exports = router;
