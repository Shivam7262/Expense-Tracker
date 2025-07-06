import express from 'express';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';
import { validateProfileUpdate } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.getProfile()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', validateProfileUpdate, async (req, res) => {
  try {
    const { name, monthlyIncome, currency, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (monthlyIncome !== undefined) user.monthlyIncome = monthlyIncome;
    if (currency) user.currency = currency;
    if (avatar !== undefined) user.avatar = avatar;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser.getProfile()
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error while updating profile' });
  }
});

// @desc    Get user dashboard data
// @route   GET /api/users/dashboard
// @access  Private
router.get('/dashboard', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Get transaction summary
    const summary = await Transaction.getUserSummary(
      req.user._id,
      startDate,
      endDate
    );

    // Get recent transactions
    const recentTransactions = await Transaction.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(5);

    // Get top categories
    const topCategories = await Transaction.getByCategory(
      req.user._id,
      startDate,
      endDate
    );

    // Calculate balance
    const balance = summary.totalIncome - summary.totalExpense;

    res.json({
      success: true,
      data: {
        summary: {
          ...summary,
          balance
        },
        recentTransactions,
        topCategories: topCategories.slice(0, 5),
        user: req.user.getProfile()
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error while fetching dashboard data' });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    let startDate, endDate;
    const now = new Date();

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    endDate = now;

    // Get summary for the period
    const summary = await Transaction.getUserSummary(
      req.user._id,
      startDate,
      endDate
    );

    // Get monthly breakdown for the year
    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: {
            $gte: new Date(now.getFullYear(), 0, 1),
            $lte: now
          }
        }
      },
      {
        $group: {
          _id: { $month: '$date' },
          income: {
            $sum: { $cond: [{ $gt: ['$amount', 0] }, '$amount', 0] }
          },
          expense: {
            $sum: { $cond: [{ $lt: ['$amount', 0] }, { $abs: '$amount' }, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get category breakdown
    const categoryBreakdown = await Transaction.getByCategory(
      req.user._id,
      startDate,
      endDate
    );

    res.json({
      success: true,
      data: {
        period,
        summary,
        monthlyData,
        categoryBreakdown
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Server error while fetching statistics' });
  }
});

// @desc    Get user settings
// @route   GET /api/users/settings
// @access  Private
router.get('/settings', async (req, res) => {
  try {
    const settings = {
      currency: req.user.currency,
      monthlyIncome: req.user.monthlyIncome,
      notifications: {
        email: true, // You can add notification settings to user model
        push: true
      },
      theme: 'light', // You can add theme preference to user model
      language: 'en' // You can add language preference to user model
    };

    res.json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Server error while fetching settings' });
  }
});

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
router.put('/settings', async (req, res) => {
  try {
    const { currency, monthlyIncome, notifications, theme, language } = req.body;

    const user = await User.findById(req.user._id);

    if (currency) user.currency = currency;
    if (monthlyIncome !== undefined) user.monthlyIncome = monthlyIncome;

    await user.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        settings: {
          currency: user.currency,
          monthlyIncome: user.monthlyIncome,
          notifications,
          theme,
          language
        }
      }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Server error while updating settings' });
  }
});

// @desc    Get user activity
// @route   GET /api/users/activity
// @access  Private
router.get('/activity', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('title amount type category date createdAt');

    const total = await Transaction.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: {
        activities: transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Activity error:', error);
    res.status(500).json({ error: 'Server error while fetching activity' });
  }
});

// @desc    Search transactions
// @route   GET /api/users/search
// @access  Private
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const searchRegex = new RegExp(q, 'i');

    const transactions = await Transaction.find({
      user: req.user._id,
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { tags: searchRegex }
      ]
    })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Transaction.countDocuments({
      user: req.user._id,
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { tags: searchRegex }
      ]
    });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Server error while searching' });
  }
});

export default router; 