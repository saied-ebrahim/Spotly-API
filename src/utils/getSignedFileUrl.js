const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3Client = require('../config/r2Client');

/**
 * Generate a signed URL for a file stored in Cloudflare R2.
 *
 * @param {string} key - The object key in the bucket.
 * @param {number} [expiresIn=3600] - Expiry time in seconds (default: 1 hour).
 * @returns {Promise<string>} - The signed URL.
 */
async function getSignedFileUrl(key, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
  return signedUrl;
}

module.exports = getSignedFileUrl;


