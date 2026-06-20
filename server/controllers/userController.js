import User from '../models/User.js';
import Settings from '../models/Settings.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      if (user.role === 'author' && !user.isAuthorApproved) {
        return res.status(403).json({ message: 'Your author account is pending approval by the Admin.' });
      }
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAuthorApproved: user.isAuthorApproved,
        royaltyPercentage: user.royaltyPercentage,
        profileImage: user.profileImage,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/users
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, bio, website } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let settings = await Settings.findOne({});
    if (!settings) {
      settings = { defaultRoyaltyPercentage: 25, autoApproveAuthors: false };
    }

    const user = await User.create({ 
      name, 
      email, 
      password,
      role: role || 'customer',
      phone,
      bio: bio || '',
      website: website || '',
      isAuthorApproved: role === 'author' ? (settings.autoApproveAuthors ?? false) : true,
      royaltyPercentage: role === 'author' ? (settings.defaultRoyaltyPercentage ?? 25) : 25
    });
    if (user) {
      // Send welcome email
      const welcomeHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #0b1329; color: #ffffff;">
          <h2 style="color: #a855f7; text-align: center; font-size: 24px; font-weight: 800;">Welcome to Pustak Maza! 📚</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">Hi ${user.name},</p>
          <p style="font-size: 14px; line-height: 1.6; color: #94a3b8;">Thank you for registering at Pustak Maza! We are thrilled to have you join our reading and publishing platform.</p>
          <p style="font-size: 14px; line-height: 1.6; color: #94a3b8;">You can now securely browse, read, play, and purchase premium books, ebooks, and audiobooks.</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/shop" style="background-color: #a855f7; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block;">Browse Book Shop</a>
          </div>
          <p style="font-size: 12px; color: #64748b; border-t: 1px solid #334155; pt-15; margin-top: 20px;">If you have any questions or feedback, feel free to reply directly to this mail.</p>
          <p style="font-size: 14px; font-weight: bold; color: #a855f7; margin-top: 15px;">Happy Reading,<br>The Pustak Maza Team</p>
        </div>
      `;
      
      // Send welcome email in background (asynchronous) to prevent blocking registration response
      sendEmail({
        email: user.email,
        subject: 'Welcome to Pustak Maza! 📚',
        html: welcomeHtml
      }).catch(mailErr => {
        console.error('Welcome email failed to send:', mailErr.message);
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAuthorApproved: user.isAuthorApproved,
        profileImage: user.profileImage,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('purchasedBooks')
      .populate('wishlist');
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        dob: user.dob,
        profileImage: user.profileImage,
        address: user.address,
        purchasedBooks: user.purchasedBooks,
        wishlist: user.wishlist,
        subscription: user.subscription,
        streak: user.streak,
        badges: user.badges,
        walletBalance: user.walletBalance,
        bio: user.bio,
        website: user.website,
        twitter: user.twitter,
        instagram: user.instagram,
        bankName: user.bankName,
        accountNumber: user.accountNumber,
        ifscCode: user.ifscCode,
        panCard: user.panCard,
        upiId: user.upiId
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      user.gender = req.body.gender || user.gender;
      user.dob = req.body.dob || user.dob;
      user.profileImage = req.body.profileImage !== undefined ? req.body.profileImage : user.profileImage;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.website = req.body.website !== undefined ? req.body.website : user.website;
      user.twitter = req.body.twitter !== undefined ? req.body.twitter : user.twitter;
      user.instagram = req.body.instagram !== undefined ? req.body.instagram : user.instagram;
      user.bankName = req.body.bankName !== undefined ? req.body.bankName : user.bankName;
      user.accountNumber = req.body.accountNumber !== undefined ? req.body.accountNumber : user.accountNumber;
      user.ifscCode = req.body.ifscCode !== undefined ? req.body.ifscCode : user.ifscCode;
      user.panCard = req.body.panCard !== undefined ? req.body.panCard : user.panCard;
      user.upiId = req.body.upiId !== undefined ? req.body.upiId : user.upiId;

      if (req.body.address) {
        user.address = {
          street: req.body.address.street || (user.address && user.address.street),
          city: req.body.address.city || (user.address && user.address.city),
          state: req.body.address.state || (user.address && user.address.state),
          zipCode: req.body.address.zipCode || (user.address && user.address.zipCode),
          country: req.body.address.country || (user.address && user.address.country),
        };
      }
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        gender: updatedUser.gender,
        dob: updatedUser.dob,
        profileImage: updatedUser.profileImage,
        address: updatedUser.address,
        purchasedBooks: updatedUser.purchasedBooks,
        wishlist: updatedUser.wishlist,
        bio: updatedUser.bio,
        website: updatedUser.website,
        twitter: updatedUser.twitter,
        instagram: updatedUser.instagram,
        bankName: updatedUser.bankName,
        accountNumber: updatedUser.accountNumber,
        ifscCode: updatedUser.ifscCode,
        panCard: updatedUser.panCard,
        upiId: updatedUser.upiId,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle book in wishlist
// @route   POST /api/users/wishlist
const toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { bookId } = req.body;

    const exists = user.wishlist.some(id => id.toString() === bookId.toString());
    if (exists) {
      user.wishlist = user.wishlist.filter(id => id.toString() !== bookId.toString());
    } else {
      user.wishlist.push(bookId);
    }
    await user.save();
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user details (Admin)
// @route   PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.role) user.role = req.body.role;
      if (req.body.isAuthorApproved !== undefined) user.isAuthorApproved = req.body.isAuthorApproved;
      if (req.body.royaltyPercentage !== undefined) user.royaltyPercentage = req.body.royaltyPercentage;

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isAuthorApproved: updatedUser.isAuthorApproved,
        royaltyPercentage: updatedUser.royaltyPercentage
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password - request OTP
// @route   POST /api/users/forgotpassword
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    let emailSent = true;
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset OTP - Pustak Maza',
        html: `
          <div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #6A0DAD; text-align: center;">Pustak Maza</h1>
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>We received a request to reset your password. Use the verification code below to proceed:</p>
            <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #6A0DAD;">${otp}</span>
            </div>
            <p style="color: #666; font-size: 14px;">This OTP is valid for 10 minutes. If you did not request this, you can safely ignore this email.</p>
          </div>
        `
      });
    } catch (mailErr) {
      console.error('===================================================');
      console.error('Password reset email failed to send:', mailErr.message);
      console.error(`LOCAL DEV OTP FOR ${user.email} IS: ${otp}`);
      console.error('===================================================');
      emailSent = false;
    }

    if (emailSent) {
      res.json({ message: 'OTP sent to email successfully' });
    } else {
      res.status(500).json({ 
        message: 'OTP generated but email delivery failed. Please check your SMTP credentials.'
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP for password reset
// @route   POST /api/users/verifyotp
const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password using OTP
// @route   POST /api/users/resetpassword
const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = password; // Pre-save hook will hash this automatically
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Google auth login/signup
// @route   POST /api/users/google-login
const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'Google ID token is required' });
    }

    const decoded = jwt.decode(idToken);
    if (!decoded || !decoded.email) {
      return res.status(400).json({ message: 'Invalid Google token structure' });
    }

    const { name, email } = decoded;

    let user = await User.findOne({ email });

    if (!user) {
      // Auto-signup Google user
      const randomPassword = Math.random().toString(36).slice(-12);
      user = await User.create({
        name,
        email,
        password: randomPassword,
        role: 'customer',
        isAuthorApproved: true
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { authUser, registerUser, getUserProfile, updateUserProfile, getUsers, toggleWishlist, updateUser, forgotPassword, verifyResetOTP, resetPassword, googleLogin };
