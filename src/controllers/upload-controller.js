import expressAsyncHandler from 'express-async-handler';
import AppError from '../utils/AppError.js';
import getSignedFileUrl from '../utils/getSignedFileUrl.js';

// Handle file upload response (Express middleware)
export const handleUpload = expressAsyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No file uploaded.', 400));
  }

  // في المرحلة دي إحنا بس بنهتم إن الملف اترفع وناخد الـ key
  // موضوع الـ signed URL ممكن نرجع له بعد ما نزبط إعدادات R2
  return res.status(200).json({
    status: 'success',
    message: 'Uploaded successfully!',
    data: {
      key: req.file.key, // File key for future reference (تقدر تخزنه في الـ DB)
    },
  });
});


// Generate signed URL for a stored file
export const getFileSignedUrl = async (req, res) => {
  try {
    const { key } = req.params;

    const url = await getSignedFileUrl(key, 3600); // 1 hour

    return res.json({ url });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error generating signed URL:", err);
    return res.status(500).json({ error: "Failed to generate signed URL" });
  }
};
