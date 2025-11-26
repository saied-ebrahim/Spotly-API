const express = require('express');
const upload = require('../middlewares/upload-middleware');
const {
  handleUpload,
  getFileSignedUrl,
} = require('../controllers/upload-controller');

const router = express.Router();

// POST /api/v1/upload
router.post('/upload', upload.single('file'), handleUpload);

// GET /api/v1/file/:key
router.get('/file/:key', getFileSignedUrl);

module.exports = router;


