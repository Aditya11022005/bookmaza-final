import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { cloudinary } from '../utils/cloudinary.js';
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

// Helper to upload a local file to Cloudinary
const uploadToCloudinaryHelper = async (filePath, originalName) => {
  const fileExtension = path.extname(originalName).toLowerCase();
  let resourceType = 'raw';
  if (['.mp3', '.wav', '.m4a', '.aac'].includes(fileExtension)) {
    resourceType = 'video';
  }
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'pustakmaza_protected',
    resource_type: resourceType,
  });
  return { url: result.secure_url, key: result.secure_url };
};

// @desc    Upload public image (Book Cover, Banner)
// @route   POST /api/upload/image
router.post('/image', protect, (req, res) => {
  uploadLocal.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'name';
    
    if (isCloudinaryConfigured) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'pustakmaza_media',
        });
        
        // Clean up local temp file since it is now on Cloudinary
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkErr) {
          console.error('Failed to clean up temp file:', unlinkErr);
        }
        
        return res.json({
          message: 'Image uploaded successfully to Cloudinary',
          url: result.secure_url,
        });
      } catch (uploadErr) {
        console.warn('Cloudinary upload failed, falling back to local storage:', uploadErr.message);
        const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        return res.json({
          message: 'Image uploaded locally (Cloudinary failed)',
          url,
        });
      }
    } else {
      const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      return res.json({
        message: 'Image uploaded locally',
        url,
      });
    }
  });
});

// @desc    Upload protected file (PDF, MP3)
// @route   POST /api/upload/protected
router.post('/protected', protect, author, (req, res) => {
  uploadLocal.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'name';

    // 1. Try Cloudinary if configured
    if (isCloudinaryConfigured) {
      try {
        const { url, key } = await uploadToCloudinaryHelper(req.file.path, req.file.originalname);
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkErr) {
          console.error('Failed to clean up Cloudinary temp file:', unlinkErr);
        }
        return res.json({
          message: 'Protected file uploaded successfully to Cloudinary',
          url,
          key,
        });
      } catch (cloudinaryErr) {
        console.warn('Cloudinary upload failed, falling back to local serving:', cloudinaryErr.message);
      }
    }

    // 2. Fallback to local storage (Cloudinary failed or not configured)
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    return res.json({
      message: 'Protected file uploaded locally',
      url,
      key: url,
    });
  });
});

export default router;
