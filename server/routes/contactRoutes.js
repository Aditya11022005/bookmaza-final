import express from 'express';
const router = express.Router();
import {
  submitContactMessage,
  getContactMessages,
  updateContactMessageStatus,
  replyToContactMessage
} from '../controllers/contactController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/')
  .post(submitContactMessage)
  .get(protect, admin, getContactMessages);

router.route('/:id')
  .put(protect, admin, updateContactMessageStatus);

router.route('/:id/reply')
  .post(protect, admin, replyToContactMessage);

export default router;
