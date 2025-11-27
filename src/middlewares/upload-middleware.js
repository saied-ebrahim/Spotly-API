import multer from "multer";
import multerS3 from "multer-s3";
import s3Client from "../config/r2Client.js";
import dotenv from "dotenv";

// Multer storage configured to upload directly to Cloudflare R2 (S3-compatible)
dotenv.config();
const upload = multer({
  storage: multerS3({ 
    s3: s3Client,
    bucket: process.env.R2_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
});

export default upload;
