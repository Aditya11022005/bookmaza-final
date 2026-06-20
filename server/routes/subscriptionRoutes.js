import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  subscribeToPlan,
  getCurrentSubscription,
  cancelSubscription
} from '../controllers/subscriptionController.js';

const router = express.Router();

router.route('/subscribe').post(protect, subscribeToPlan);
router.route('/current').get(protect, getCurrentSubscription);
router.route('/cancel').post(protect, cancelSubscription);

export default router;
