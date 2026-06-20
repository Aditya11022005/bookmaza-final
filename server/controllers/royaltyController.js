import Royalty from '../models/Royalty.js';
import Withdrawal from '../models/Withdrawal.js';
import User from '../models/User.js';

// @desc    Get author royalty statistics
// @route   GET /api/royalties/stats
// @access  Private (Author)
const getAuthorRoyaltyStats = async (req, res) => {
  try {
    const authorId = req.user._id;

    // Fetch author user record for wallet balance
    const user = await User.findById(authorId);
    if (!user) return res.status(404).json({ message: 'Author not found' });

    // Sum all accrued royalties
    const royalties = await Royalty.find({ author: authorId }).populate('book', 'title');
    const lifetimeEarnings = royalties.reduce((sum, item) => sum + item.royaltyAmount, 0);

    // Sum monthly earnings
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const monthlyEarnings = royalties
      .filter(item => new Date(item.createdAt) >= oneMonthAgo)
      .reduce((sum, item) => sum + item.royaltyAmount, 0);

    res.json({
      walletBalance: user.walletBalance || 0,
      lifetimeEarnings,
      monthlyEarnings,
      salesCount: royalties.length,
      history: royalties
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create author withdrawal request
// @route   POST /api/royalties/withdraw
// @access  Private (Author)
const createWithdrawRequest = async (req, res) => {
  try {
    const { amount, bankName, accountNumber, ifscCode, upiId } = req.body;
    const authorId = req.user._id;

    const user = await User.findById(authorId);
    if (user.walletBalance < amount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Deduct from wallet balance
    user.walletBalance -= amount;
    await user.save();

    const withdrawal = new Withdrawal({
      author: authorId,
      amount,
      paymentDetails: { bankName, accountNumber, ifscCode, upiId }
    });

    const created = await withdrawal.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get author withdrawal history
// @route   GET /api/royalties/withdrawals
// @access  Private (Author)
const getAuthorWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all withdrawal requests (Admin)
// @route   GET /api/royalties/admin/withdrawals
// @access  Private (Admin)
const getAllWithdrawRequests = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({})
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve/Reject withdrawal request (Admin)
// @route   PUT /api/royalties/admin/withdrawals/:id
// @access  Private (Admin)
const updateWithdrawStatus = async (req, res) => {
  try {
    const { status, transactionId } = req.body;
    const withdrawal = await Withdrawal.findById(req.params.id);

    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal request not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: 'Request is already processed' });
    }

    if (status === 'rejected') {
      // Refund wallet balance
      await User.findByIdAndUpdate(withdrawal.author, {
        $inc: { walletBalance: withdrawal.amount }
      });
    }

    withdrawal.status = status;
    if (transactionId) withdrawal.transactionId = transactionId;
    withdrawal.processedAt = Date.now();

    const updated = await withdrawal.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getAuthorRoyaltyStats,
  createWithdrawRequest,
  getAuthorWithdrawals,
  getAllWithdrawRequests,
  updateWithdrawStatus
};
