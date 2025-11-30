import getSignedFileUrl from '../utils/getSignedFileUrl.js';
import expressAsyncHandler from 'express-async-handler';
import AppError from '../utils/AppError.js';
// Handle file upload response
export const handleUpload = ()=>{
  return expressAsyncHandler(async (req, res,next) => {
    if (!req.file) {
     return next(new AppError('No file uploaded.', 400));
    }
    return res.json({
      message: 'Uploaded successfully!',
      key: req.file.key, // used later to generate signed URL
    });
  });
}


// Generate signed URL for a stored file
export const getFileSignedUrl = async (req, res) => {
  try {
    const { key } = req.params;

    const url = await getSignedFileUrl(key, 3600); // 1 hour

    return res.json({ url });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error generating signed URL:', err);
    return res.status(500).json({ error: 'Failed to generate signed URL' });
  }
};


