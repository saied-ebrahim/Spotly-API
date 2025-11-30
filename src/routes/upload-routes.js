import express from 'express';
import upload from '../middlewares/upload-middleware.js';
import {
  handleUpload,
  getFileSignedUrl,
} from '../controllers/upload-controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/upload/upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (image or video)
 *     responses:
 *       200:
 *         description: File successfully uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     fileUrl:
 *                       type: string
 *                       example: "https://example.com/uploads/file.jpg"
 *                     key:
 *                       type: string
 *                       example: "uploads/file.jpg"
 *       400:
 *         description: No file provided or invalid file type
 *       500:
 *         description: Upload error
 */
router.post('/upload', upload.single('file'), handleUpload);

/**
 * @swagger
 * /api/v1/upload/file/{key}:
 *   get:
 *     summary: Get signed URL for a file
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: File key/path
 *         example: "uploads/file.jpg"
 *     responses:
 *       200:
 *         description: Signed URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     signedUrl:
 *                       type: string
 *                       example: "https://example.com/uploads/file.jpg?signature=..."
 *       404:
 *         description: File not found
 */
router.get('/file/:key', getFileSignedUrl);

export default router;


