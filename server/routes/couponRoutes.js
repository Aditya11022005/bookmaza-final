import express from 'express';
const router = express.Router();
import {
  getCoupons,
  createCoupon,
  deleteCoupon,
  validateCoupon,
  updateCoupon
} from '../controllers/couponController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').get(protect, admin, getCoupons).post(protect, admin, createCoupon);
router.route('/validate').post(protect, validateCoupon);
router.route('/:id')
  .delete(protect, admin, deleteCoupon)
  .put(protect, admin, updateCoupon);

export default router;
