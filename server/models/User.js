import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'author', 'customer'], default: 'customer' },
    phone: { type: String },
    gender: { type: String },
    dob: { type: String },
    isAuthorApproved: { type: Boolean, default: false },
    royaltyPercentage: { type: Number, default: 25 },
    purchasedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    followedAuthors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    cart: [
      {
        book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
        format: String,
        qty: Number,
      }
    ],
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    walletBalance: { type: Number, default: 0 },
    subscription: {
      plan: { type: String, enum: ['free', 'basic', 'premium', 'gold'], default: 'free' },
      endDate: Date,
      active: { type: Boolean, default: false }
    },
    streak: {
      count: { type: Number, default: 0 },
      lastActive: Date
    },
    badges: [{ type: String }],
    profileImage: { type: String, default: '' },
    bio: { type: String, default: '' },
    website: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    panCard: { type: String, default: '' },
    upiId: { type: String, default: '' },
    resetPasswordOTP: { type: String },
    resetPasswordExpires: { type: Date }
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.index({ role: 1 });
userSchema.index({ isAuthorApproved: 1 });

const User = mongoose.model('User', userSchema);
export default User;
