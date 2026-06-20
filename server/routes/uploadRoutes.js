import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { storage } from '../utils/cloudinary.js';
import { uploadS3 } from '../utils/s3.js';
import { protect, author } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ensure public/uploads directory exists locally
const uploadDir = 'public/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Local storage configuration
const localDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadLocal = multer({ storage: localDiskStorage });
const uploadCloudinary = multer({ storage });

// @desc    Upload public image (Book Cover, Banner)
// @route   POST /api/upload/image
router.post('/image', protect, (req, res) => {
  const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'name';

  if (!isCloudinaryConfigured) {
    // Force local upload fallback
    uploadLocal.single('image')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      if (req.file) {
        const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        return res.json({ message: 'Image uploaded locally', url });
      }
      return res.status(400).json({ message: 'No file uploaded' });
    });
  } else {
    // Try Cloudinary
    uploadCloudinary.single('image')(req, res, (err) => {
      if (err) {
        console.warn('Cloudinary upload failed, falling back to local storage:', err.message);
        // Fallback to local upload
        return uploadLocal.single('image')(req, res, (localErr) => {
          if (localErr) {
            return res.status(400).json({ message: localErr.message });
          }
          if (req.file) {
            const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            return res.json({ message: 'Image uploaded locally', url });
          }
          return res.status(400).json({ message: 'No file uploaded' });
        });
      }
      if (req.file) {
        return res.json({
          message: 'Image uploaded successfully',
          url: req.file.path,
        });
      }
      return res.status(400).json({ message: 'No file uploaded' });
    });
  }
});

// @desc    Upload protected file (PDF, MP3) to S3
// @route   POST /api/upload/protected
router.post('/protected', protect, author, (req, res) => {
  const isS3Configured = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID !== 'key';

  if (!isS3Configured) {
    // Force local upload fallback
    uploadLocal.single('file')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      if (req.file) {
        const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        return res.json({
          message: 'Protected file uploaded locally',
          url,
          key: url, // Treat local url as key
        });
      }
      return res.status(400).json({ message: 'No file uploaded' });
    });
  } else {
    // Try S3
    uploadS3.single('file')(req, res, (err) => {
      if (err) {
        console.warn('S3 upload failed, falling back to local storage:', err.message);
        // Fallback to local upload
        return uploadLocal.single('file')(req, res, (localErr) => {
          if (localErr) {
            return res.status(400).json({ message: localErr.message });
          }
          if (req.file) {
            const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            return res.json({
              message: 'Protected file uploaded locally',
              url,
              key: url,
            });
          }
          return res.status(400).json({ message: 'No file uploaded' });
        });
      }
      if (req.file) {
        return res.json({
          message: 'Protected file uploaded successfully to S3',
          url: req.file.location, // S3 URL
          key: req.file.key, // used for pre-signed URLs
        });
      }
      return res.status(400).json({ message: 'No file uploaded' });
    });
  }
});

export default router;
