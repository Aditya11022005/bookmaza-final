import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getPosts,
  createPost,
  toggleLikePost,
  commentOnPost
} from '../controllers/communityController.js';

const router = express.Router();

router.route('/posts')
  .get(getPosts)
  .post(protect, createPost);

router.route('/posts/:id/like').post(protect, toggleLikePost);
router.route('/posts/:id/comment').post(protect, commentOnPost);

export default router;
