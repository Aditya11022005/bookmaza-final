import express from 'express';
const router = express.Router();
import { getProgress, updateProgress, getAllProgress } from '../controllers/progressController.js';
import { protect } from '../middleware/authMiddleware.js';

router.get('/all', protect, getAllProgress);
router.post('/', protect, updateProgress);
router.get('/:bookId/:format', protect, getProgress);

export default router;
