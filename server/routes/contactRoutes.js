import express from 'express';
const router = express.Router();
import {
  submitContactMessage,
  getContactMessages,
  updateContactMessageStatus,
  replyToContactMessage,
  deleteContactMessage
} from '../controllers/contactController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/')
  .post(submitContactMessage)
  .get(protect, admin, getContactMessages);

router.route('/:id')
  .put(protect, admin, updateContactMessageStatus)
  .delete(protect, admin, deleteContactMessage);

router.route('/:id/reply')
  .post(protect, admin, replyToContactMessage);

export default router;

