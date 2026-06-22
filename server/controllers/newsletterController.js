import NewsletterSubscriber from '../models/NewsletterSubscriber.js';

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
export const subscribeToNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Check if already subscribed
    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) {
      if (existing.active) {
        return res.status(400).json({ message: 'This email is already subscribed!' });
      } else {
        existing.active = true;
        await existing.save();
        return res.status(200).json({ message: 'Welcome back! Subscription re-activated successfully.' });
      }
    }

    const subscriber = new NewsletterSubscriber({ email });
    await subscriber.save();

    res.status(201).json({ message: 'Thank you for subscribing to our newsletter! 📬' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all subscribers
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
export const getNewsletterSubscribers = async (req, res) => {
  try {
    const subscribers = await NewsletterSubscriber.find({}).sort({ createdAt: -1 });
    res.status(200).json(subscribers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete/Unsubscribe subscriber
// @route   DELETE /api/newsletter/subscribers/:id
// @access  Private/Admin
export const unsubscribeNewsletter = async (req, res) => {
  try {
    const subscriber = await NewsletterSubscriber.findById(req.params.id);

    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    await subscriber.deleteOne();
    res.status(200).json({ message: 'Subscriber removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
