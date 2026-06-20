import express from 'express';
import { protect, admin, author } from '../middleware/authMiddleware.js';
import {
  getAuthorRoyaltyStats,
  createWithdrawRequest,
  getAuthorWithdrawals,
  getAllWithdrawRequests,
  updateWithdrawStatus
} from '../controllers/royaltyController.js';

const router = express.Router();

router.route('/stats').get(protect, author, getAuthorRoyaltyStats);
router.route('/withdraw').post(protect, author, createWithdrawRequest);
router.route('/withdrawals').get(protect, author, getAuthorWithdrawals);
router.route('/admin/withdrawals').get(protect, admin, getAllWithdrawRequests);
router.route('/admin/withdrawals/:id').put(protect, admin, updateWithdrawStatus);

export default router;
