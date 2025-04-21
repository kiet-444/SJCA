const express = require('express');
const JobExecuteController = require('../controllers/JobExecute.controller');
const { verifyToken, isEmployer, isWorker } = require('../middleware/auth.middleware');
const router = express.Router();
const multer = require('multer');
const upload = multer();

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
 * /job-execute/job-posting/{jobPostingId}:
 *   get:
 *     summary: Get job executions by jobPostingId
 *     tags: [Job Execute]
 *     parameters:
 *       - in: path
 *         name: jobPostingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Job executions retrieved successfully
 *       404:
 *         description: Job execution not found
 *       500:
 *         description: Internal server error
 */
router.get('/job-execute/job-posting/:jobPostingId', verifyToken, JobExecuteController.getJobExecuteByJobPostingId);

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
router.patch('/job-execute/:id', upload.fields([
    {name: 'checkin_img', maxCount: 1},
    {name: 'checkout_img', maxCount: 1}
]), verifyToken, JobExecuteController.updateJobExecute);


/**
 * @swagger
 *  /job-execute/{id}:
 *   delete:
 *     summary: Delete a job execution
 *     tags: [Job Execute]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Job execute deleted successfully
 *       404:
 *         description: Job execute not found
 *       500:
 *         description: Internal server error
 */
router.delete('/job-execute/:id', verifyToken, isEmployer, JobExecuteController.deleteJobExecute);

module.exports = router;