const express = require('express');
const router = express.Router();
const MediaController = require('../controllers/Media.controller');

const multer = require('multer');
const uploadMiddleware = multer().array('files');

/**
 * @swagger
 * /api/media/upload:
 *   post:
 *     summary: Upload a file (image or PDF) to Cloudinary
 *     tags: [Media]
 *     description: Upload an image or PDF and get back the Cloudinary URL
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (image or PDF)
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Cloudinary public_id
 *                 name:
 *                   type: string
 *                   description: Original file name
 *                 url:
 *                   type: string
 *                   description: Secure URL of uploaded file
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Internal server error
 */
router.post('/upload', uploadMiddleware, MediaController.upload);

/**
 *  
 * @swagger
 * /api/media/uploadFile:
 *   post:
 *     summary: Upload a file (image or PDF) to Cloudinary
 *     tags: [Media]
 *     description: Upload an image or PDF and get back the Cloudinary URL
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (image or PDF)
 *     responses:
 *       200:
 *         description: File uploaded successfully  
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Cloudinary public_id
 *                 name:
 *                   type: string
 *                   description: Original file name
 *                 url: 
 *                   type: string
 *                   description: Secure URL of uploaded file
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: No file uploaded    
 *       500:
 *         description: Internal server error
 */
router.post('/uploadFile', uploadMiddleware, MediaController.uploadFile);

/**
 *  
 * @swagger
 * /api/media/delete/{public_id}:
 *   delete:
 *     summary: Delete a file from Cloudinary
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: public_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cloudinary public_id of the file to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       404:
 *         description: File not found
 *       500:
 *         description: Internal server error
 * */
router.delete('/delete/:public_id', MediaController.deleteMedia);

module.exports = router;

