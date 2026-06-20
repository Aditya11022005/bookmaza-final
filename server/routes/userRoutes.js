import express from 'express';
import { check } from 'express-validator';
const router = express.Router();
import { authUser, registerUser, getUserProfile, updateUserProfile, getUsers, toggleWishlist, updateUser, forgotPassword, verifyResetOTP, resetPassword, googleLogin } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';

router.route('/').post(
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  validateRequest,
  registerUser
).get(protect, admin, getUsers);

router.post('/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  validateRequest,
  authUser
);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.route('/wishlist').post(protect, toggleWishlist);

router.post('/forgotpassword', forgotPassword);
router.post('/verifyotp', verifyResetOTP);
router.post('/resetpassword', resetPassword);
router.post('/google-login', googleLogin);

router.route('/:id').put(protect, admin, updateUser);

export default router;
