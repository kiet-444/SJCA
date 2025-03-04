const express = require('express');
const JobExecuteController = require('../controllers/JobExecute.controller');
const { verifyToken, isEmployer } = require('../middleware/auth.middleware');
const router = express.Router();

/**
 * @swagger
 * /job-execute:
 *   post:
 *     summary: Create a new job execution
 *     tags: [Job Execute]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jobPostingId:
 *                 type: integer
 *               userId:
 *                 type: integer
 *               assigned_at:
 *                 type: string
 *               checkin_at:
 *                 type: string
 *               checkout_at:
 *                 type: string
 *               status:
 *                 type: string
 *               note:
 *                 type: string
 *               work_process:
 *                 type: string
 *     responses:
 *       201:
 *         description: Job execute created successfully
 *       500:
 *         description: Internal server error
 */
router.post('/job-execute', verifyToken, JobExecuteController.createJobExecute);

/**
 * @swagger
 * /job-execute/daily/{userId}:
 *   get:
 *     summary: Get daily jobs for a worker
 *     tags: [Job Execute]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Daily jobs retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/job-execute/daily/:userId', verifyToken,  JobExecuteController.getDailyJobs);

/**
 * @swagger
 * /job-execute/{id}:
 *   patch:
 *     summary: Update a job execution
 *     tags: [Job Execute]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               checkin_at:
 *                 type: string
 *               checkout_at:
 *                 type: string
 *               status:
 *                 type: string
 *               note:
 *                 type: string
 *               work_process:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job execute updated successfully
 *       404:
 *         description: Job execute not found
 *       500:
 *         description: Internal server error
 */
router.patch('/job-execute/:id', verifyToken, isEmployer, JobExecuteController.updateJobExecute);

module.exports = router;