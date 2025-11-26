import express from 'express';
import upload from '../middlewares/upload-middleware.js';
import {
  handleUpload,
  getFileSignedUrl,
} from '../controllers/upload-controller.js';

const router = express.Router();

// POST /api/v1/upload
router.post('/upload', upload.single('file'), handleUpload);

// GET /api/v1/file/:key
router.get('/file/:key', getFileSignedUrl);

export default router;


