import Order from '../models/Order.js';
import User from '../models/User.js';
import Book from '../models/Book.js';

// @desc    Get admin analytics overview
// @route   GET /api/analytics
const getAdminAnalytics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({});
    const totalUsers = await User.countDocuments({});
    const totalBooks = await Book.countDocuments({});

    const orders = await Order.find({});
    const totalRevenue = orders.reduce((acc, order) => acc + (order.isPaid ? order.totalPrice : 0), 0);

    const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(5).populate('user', 'name email');

    res.json({
      totalOrders,
      totalUsers,
      totalBooks,
      totalRevenue,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get author earnings overview
// @route   GET /api/analytics/author
const getAuthorEarnings = async (req, res) => {
  try {
    const authorId = req.user._id;

    // Find books created by this author
    const authorBooks = await Book.find({ author: authorId });
    const bookIds = authorBooks.map(book => book._id.toString());

    // Find orders that contain these books
    const orders = await Order.find({
      'orderItems.book': { $in: bookIds },
      isPaid: true
    });

    let totalSales = 0;
    let totalEarnings = 0;
    const itemsSold = [];

    // Assuming a fixed 10% platform commission
    const PLATFORM_FEE_PERCENT = 10;

    orders.forEach(order => {
      order.orderItems.forEach(item => {
        if (bookIds.includes(item.book.toString())) {
          totalSales += item.qty;
          const revenue = item.price * item.qty;
          const earnings = revenue - (revenue * PLATFORM_FEE_PERCENT) / 100;
          totalEarnings += earnings;
          
          itemsSold.push({
            title: item.title,
            format: item.format,
            qty: item.qty,
            revenue,
            earnings,
            date: order.paidAt
          });
        }
      });
    });

    res.json({
      totalBooks: authorBooks.length,
      totalSales,
      totalEarnings,
      platformFeePercent: PLATFORM_FEE_PERCENT,
      recentSales: itemsSold.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getAdminAnalytics, getAuthorEarnings };
