import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getCMSPage, updateCMSPage } from '../controllers/cmsController.js';

const router = express.Router();

router.route('/:page')
  .get(getCMSPage)
  .post(protect, admin, updateCMSPage);

export default router;
