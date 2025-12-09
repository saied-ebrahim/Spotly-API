import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../config/r2Client.js";
import getSignedFileUrl from "./getSignedFileUrl.js";

/**
 * Upload QR code buffer to Cloudflare R2
 * @param {Buffer} qrBuffer - QR code image buffer
 * @param {string} ticketId - Ticket ID for unique file naming
 * @returns {Promise<string>} - R2 file key
 */
const uploadQRToR2 = async (qrBuffer, ticketId) => {
  try {
    const key = `qr-codes/ticket-${ticketId}-${Date.now()}.png`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: qrBuffer,
      ContentType: "image/png",
    });

    await s3Client.send(command);
    
    return key;
  } catch (error) {
    console.error("Error uploading QR code to R2:", error);
    throw new Error(`Failed to upload QR code to R2: ${error.message}`);
  }
};

/**
 * Upload QR code and return signed URL
 * @param {Buffer} qrBuffer - QR code image buffer
 * @param {string} ticketId - Ticket ID for unique file naming
 * @param {number} expiresIn - Signed URL expiration time in seconds (default: 7 days, max: 604800)
 * @returns {Promise<string>} - Signed URL for the QR code
 * @note AWS S3/R2 presigned URLs have a maximum expiration of 7 days (604800 seconds)
 */
const uploadQRToR2WithSignedUrl = async (qrBuffer, ticketId, expiresIn = 604800) => {
  // Ensure expiration doesn't exceed AWS S3/R2 limit (7 days)
  const maxExpiration = 604800; // 7 days in seconds
  const validExpiration = Math.min(expiresIn, maxExpiration);
  
  const key = await uploadQRToR2(qrBuffer, ticketId);
  const signedUrl = await getSignedFileUrl(key, validExpiration);
  return signedUrl;
};

export { uploadQRToR2, uploadQRToR2WithSignedUrl };

