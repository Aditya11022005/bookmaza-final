import express from 'express';
const router = express.Router();
import { getAdminAnalytics, getAuthorEarnings } from '../controllers/analyticsController.js';
import { protect, admin, author } from '../middleware/authMiddleware.js';

router.route('/').get(protect, admin, getAdminAnalytics);
router.route('/author').get(protect, author, getAuthorEarnings);

export default router;
