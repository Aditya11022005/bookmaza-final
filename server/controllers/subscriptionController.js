import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

// @desc    Subscribe to a plan
// @route   POST /api/subscriptions/subscribe
// @access  Private
const subscribeToPlan = async (req, res) => {
  try {
    const { plan, paymentId } = req.body;
    const userId = req.user._id;

    if (!['basic', 'premium', 'gold'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid subscription plan' });
    }

    const durationDays = 30; // standard 30 day subscription
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    const subscription = new Subscription({
      user: userId,
      plan,
      endDate,
      paymentId
    });
    await subscription.save();

    // Update user record
    await User.findByIdAndUpdate(userId, {
      subscription: {
        plan,
        endDate,
        active: true
      }
    });

    res.status(201).json({
      message: `Successfully subscribed to ${plan} plan`,
      subscription
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current subscription details
// @route   GET /api/subscriptions/current
// @access  Private
const getCurrentSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id, status: 'active' }).sort({ createdAt: -1 });
    if (!subscription) {
      return res.json({ plan: 'free', active: false });
    }

    // Check if subscription has expired
    if (new Date() > new Date(subscription.endDate)) {
      subscription.status = 'expired';
      await subscription.save();

      // Update user details
      await User.findByIdAndUpdate(req.user._id, {
        'subscription.active': false,
        'subscription.plan': 'free'
      });

      return res.json({ plan: 'free', active: false });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel subscription
// @route   POST /api/subscriptions/cancel
// @access  Private
const cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id, status: 'active' }).sort({ createdAt: -1 });
    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    subscription.status = 'cancelled';
    await subscription.save();

    await User.findByIdAndUpdate(req.user._id, {
      'subscription.active': false,
      'subscription.plan': 'free'
    });

    res.json({ message: 'Subscription successfully cancelled', subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  subscribeToPlan,
  getCurrentSubscription,
  cancelSubscription
};
