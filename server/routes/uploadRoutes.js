import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { storage, cloudinary } from '../utils/cloudinary.js';
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

// Helper to handle local upload followed by Cloudinary upload if configured
const handleLocalOrCloudinaryUpload = (req, res, localErr) => {
  if (localErr) {
    return res.status(400).json({ message: localErr.message });
  }
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'name';
  if (isCloudinaryConfigured) {
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let resourceType = 'raw';
    if (['.mp3', '.wav', '.m4a', '.aac'].includes(fileExtension)) {
      resourceType = 'video';
    }

    cloudinary.uploader.upload(req.file.path, {
      folder: 'pustakmaza_protected',
      resource_type: resourceType,
    })
    .then((result) => {
      // Clean up local temp file
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Failed to clean up temp file:', err);
      }
      return res.json({
        message: 'Protected file uploaded successfully to Cloudinary',
        url: result.secure_url,
        key: result.secure_url,
      });
    })
    .catch((uploadErr) => {
      console.warn('Cloudinary upload failed, falling back to local serving:', uploadErr.message);
      const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      return res.json({
        message: 'Protected file uploaded locally (Cloudinary failed)',
        url,
        key: url,
      });
    });
  } else {
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    return res.json({
      message: 'Protected file uploaded locally',
      url,
      key: url,
    });
  }
};

// @desc    Upload protected file (PDF, MP3) to S3
// @route   POST /api/upload/protected
router.post('/protected', protect, author, (req, res) => {
  const isS3Configured = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID !== 'key';

  if (!isS3Configured) {
    // Force local/Cloudinary upload fallback
    uploadLocal.single('file')(req, res, (err) => {
      handleLocalOrCloudinaryUpload(req, res, err);
    });
  } else {
    // Try S3
    uploadS3.single('file')(req, res, (err) => {
      if (err) {
        console.warn('S3 upload failed, falling back to local/Cloudinary storage:', err.message);
        // Fallback to local/Cloudinary upload
        return uploadLocal.single('file')(req, res, (localErr) => {
          handleLocalOrCloudinaryUpload(req, res, localErr);
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
