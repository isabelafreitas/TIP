/**
 * Storage service stub for S3/R2 file uploads.
 * In production, replace with real AWS SDK / Cloudflare R2 calls.
 */

const IS_DEV = process.env.NODE_ENV !== 'production';

/**
 * Upload a file buffer to object storage.
 * @param {Buffer} buffer - file data
 * @param {string} filename - desired filename (will be prefixed with timestamp)
 * @param {string} mimetype - MIME type of the file
 * @returns {Promise<string>} public URL of the uploaded file
 */
async function uploadFile(buffer, filename, mimetype) {
  if (IS_DEV) {
    const mockUrl = `https://storage.stub.tip.app/${Date.now()}_${filename}`;
    console.log(`[STORAGE STUB] uploadFile filename=${filename} mimetype=${mimetype} size=${buffer.length} → ${mockUrl}`);
    return mockUrl;
  }

  // Production: real S3/R2 upload
  const AWS = require('aws-sdk');
  const s3 = new AWS.S3({
    endpoint: process.env.R2_ENDPOINT,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    region: process.env.R2_REGION || 'auto',
    signatureVersion: 'v4',
  });

  const key = `uploads/${Date.now()}_${filename}`;
  await s3.putObject({
    Bucket: process.env.R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
    ACL: 'public-read',
  }).promise();

  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

/**
 * Delete a file from object storage by URL.
 * @param {string} url - public URL of the file
 */
async function deleteFile(url) {
  if (IS_DEV) {
    console.log(`[STORAGE STUB] deleteFile url=${url}`);
    return { deleted: true };
  }

  const AWS = require('aws-sdk');
  const s3 = new AWS.S3({
    endpoint: process.env.R2_ENDPOINT,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    region: process.env.R2_REGION || 'auto',
    signatureVersion: 'v4',
  });

  const key = url.replace(`${process.env.R2_PUBLIC_URL}/`, '');
  await s3.deleteObject({ Bucket: process.env.R2_BUCKET, Key: key }).promise();
  return { deleted: true };
}

module.exports = { uploadFile, deleteFile };
