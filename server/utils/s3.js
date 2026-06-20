import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    acl: 'private', // Protected files
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, `protected-media/${Date.now().toString()}-${file.originalname}`);
    },
  }),
});

const generatePresignedUrl = async (key, expiresIn = 3600) => {
  try {
    const isS3Configured = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID !== 'key';
    if (!isS3Configured || !key || key.startsWith('http')) {
      return key || '';
    }
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    });
    return await getSignedUrl(s3, command, { expiresIn });
  } catch (error) {
    console.warn('Failed to generate S3 pre-signed URL, falling back to key:', error.message);
    return key || '';
  }
};

export { s3, uploadS3, generatePresignedUrl };
