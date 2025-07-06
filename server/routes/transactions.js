import express from 'express';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';
import { validateTransaction } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// @desc    Get all transactions for a user
// @route   GET /api/transactions
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, type, category, startDate, endDate, sortBy = 'date', sortOrder = 'desc' } = req.query;

    // Build filter object
    const filter = { user: req.user._id };
    
    if (type) filter.type = type;
    if (category) filter.category = category;
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await Transaction.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Transaction.countDocuments(filter);

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
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Server error while fetching transactions' });
  }
});

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Server error while fetching transaction' });
  }
});

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
router.post('/', validateTransaction, async (req, res) => {
  try {
    const transactionData = {
      ...req.body,
      user: req.user._id
    };

    const transaction = await Transaction.create(transactionData);

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: { transaction }
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Server error while creating transaction' });
  }
});

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
router.put('/:id', validateTransaction, async (req, res) => {
  try {
    let transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Update transaction
    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: { transaction }
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Server error while updating transaction' });
  }
});

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Server error while deleting transaction' });
  }
});

// @desc    Get transaction summary
// @route   GET /api/transactions/summary
// @access  Private
router.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const summary = await Transaction.getUserSummary(
      req.user._id,
      startDate,
      endDate
    );

    res.json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Server error while fetching summary' });
  }
});

// @desc    Get transactions by category
// @route   GET /api/transactions/categories
// @access  Private
router.get('/categories', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const categories = await Transaction.getByCategory(
      req.user._id,
      startDate,
      endDate
    );

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error while fetching categories' });
  }
});

// @desc    Get unique categories
// @route   GET /api/transactions/categories/list
// @access  Private
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Transaction.distinct('category', {
      user: req.user._id
    });

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories list error:', error);
    res.status(500).json({ error: 'Server error while fetching categories list' });
  }
});

// @desc    Bulk delete transactions
// @route   DELETE /api/transactions/bulk
// @access  Private
router.delete('/bulk', async (req, res) => {
  try {
    const { transactionIds } = req.body;

    if (!transactionIds || !Array.isArray(transactionIds)) {
      return res.status(400).json({ error: 'Transaction IDs array is required' });
    }

    const result = await Transaction.deleteMany({
      _id: { $in: transactionIds },
      user: req.user._id
    });

    res.json({
      success: true,
      message: `${result.deletedCount} transactions deleted successfully`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ error: 'Server error while bulk deleting transactions' });
  }
});

// @desc    Export transactions
// @route   GET /api/transactions/export
// @access  Private
router.get('/export', async (req, res) => {
  try {
    const { format = 'json', startDate, endDate } = req.query;

    // Build filter object
    const filter = { user: req.user._id };
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = 'Date,Title,Amount,Type,Category,Description\n';
      const csvData = transactions.map(t => 
        `${t.date.toISOString().split('T')[0]},"${t.title}",${t.amount},${t.type},"${t.category}","${t.description || ''}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
      res.send(csvHeader + csvData);
    } else {
      res.json({
        success: true,
        data: { transactions }
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Server error while exporting transactions' });
  }
});

export default router; 