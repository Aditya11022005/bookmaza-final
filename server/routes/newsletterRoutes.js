import express from 'express';
const router = express.Router();
import {
  subscribeToNewsletter,
  getNewsletterSubscribers,
  unsubscribeNewsletter
} from '../controllers/newsletterController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/subscribe').post(subscribeToNewsletter);
router.route('/subscribers').get(protect, admin, getNewsletterSubscribers);
router.route('/subscribers/:id').delete(protect, admin, unsubscribeNewsletter);

export default router;
