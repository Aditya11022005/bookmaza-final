import express from 'express';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  createBookReview,
  deleteBookReview,
  proxyPdf,
  getAnnouncementBook,
} from '../controllers/bookController.js';
import { protect, author, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getBooks).post(protect, author, createBook);
router.get('/announcement', getAnnouncementBook);
router.get('/pdf-proxy', proxyPdf);
router.route('/:id/reviews').post(protect, createBookReview);
router.route('/:id/reviews/:reviewId').delete(protect, admin, deleteBookReview);
router.route('/:id').get(getBookById).put(protect, author, updateBook).delete(protect, author, deleteBook);

export default router;
