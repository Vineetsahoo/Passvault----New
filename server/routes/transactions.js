import express from 'express';
import mongoose from 'mongoose';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { validateTransaction, validatePagination, validateObjectIdParam } from '../utils/validation.js';
import User from '../models/User.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/transactions
 * @desc    Get user transaction history with filtering and pagination
 * @access  Private
 */
router.get('/', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, startDate, endDate, sortBy = '-createdAt' } = req.query;
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    // Build query
    const query = { userId };

    if (type) {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Get user and extract transactions from billing history
    const user = await User.findById(userId).select('billing.transactions billing.subscription');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get transactions from user billing
    let transactions = user.billing?.transactions || [];

    // Apply filters
    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }

    if (status) {
      transactions = transactions.filter(t => t.status === status);
    }

    if (startDate) {
      const start = new Date(startDate);
      transactions = transactions.filter(t => new Date(t.createdAt) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      transactions = transactions.filter(t => new Date(t.createdAt) <= end);
    }

    // Sort transactions
    const sortField = sortBy.startsWith('-') ? sortBy.slice(1) : sortBy;
    const sortOrder = sortBy.startsWith('-') ? -1 : 1;
    
    transactions.sort((a, b) => {
      if (a[sortField] < b[sortField]) return -sortOrder;
      if (a[sortField] > b[sortField]) return sortOrder;
      return 0;
    });

    // Calculate pagination
    const total = transactions.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    // Calculate statistics
    const stats = {
      total: transactions.length,
      byType: {
        subscription: transactions.filter(t => t.type === 'subscription').length,
        upgrade: transactions.filter(t => t.type === 'upgrade').length,
        refund: transactions.filter(t => t.type === 'refund').length,
        payment: transactions.filter(t => t.type === 'payment').length
      },
      byStatus: {
        completed: transactions.filter(t => t.status === 'completed').length,
        pending: transactions.filter(t => t.status === 'pending').length,
        failed: transactions.filter(t => t.status === 'failed').length,
        refunded: transactions.filter(t => t.status === 'refunded').length
      },
      totalAmount: transactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0)
    };

    res.json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: {
        transactions: paginatedTransactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: endIndex < total,
          hasPrevPage: page > 1
        },
        statistics: stats,
        subscription: {
          plan: user.billing?.subscription?.plan || 'free',
          status: user.billing?.subscription?.status || 'active',
          currentPeriodEnd: user.billing?.subscription?.currentPeriodEnd || null
        }
      }
    });

  } catch (error) {
    logger.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/transactions/stats
 * @desc    Get transaction statistics
 * @access  Private
 */
router.get('/stats', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate.setFullYear(2020, 0, 1); // Get all transactions
        break;
    }

    // Get user transactions
    const user = await User.findById(userId).select('billing');
    const allTransactions = user.billing?.transactions || [];
    
    // Filter by date
    const transactions = allTransactions.filter(t => new Date(t.createdAt) >= startDate);

    // Calculate statistics
    const stats = {
      period,
      totalTransactions: transactions.length,
      totalAmount: transactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0),
      byType: {
        subscription: transactions.filter(t => t.type === 'subscription').length,
        upgrade: transactions.filter(t => t.type === 'upgrade').length,
        refund: transactions.filter(t => t.type === 'refund').length,
        payment: transactions.filter(t => t.type === 'payment').length
      },
      byStatus: {
        completed: transactions.filter(t => t.status === 'completed').length,
        pending: transactions.filter(t => t.status === 'pending').length,
        failed: transactions.filter(t => t.status === 'failed').length,
        refunded: transactions.filter(t => t.status === 'refunded').length
      },
      byMonth: getTransactionsByMonth(transactions),
      recentTransactions: transactions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
      averageTransactionAmount: transactions.length > 0
        ? transactions
            .filter(t => t.status === 'completed')
            .reduce((sum, t) => sum + (t.amount || 0), 0) / transactions.filter(t => t.status === 'completed').length
        : 0
    };

    // Get current subscription info
    const subscription = {
      plan: user.billing?.subscription?.plan || 'free',
      status: user.billing?.subscription?.status || 'active',
      billingCycle: user.billing?.subscription?.billingCycle || 'monthly',
      amount: user.billing?.subscription?.amount || 0,
      currentPeriodStart: user.billing?.subscription?.currentPeriodStart || null,
      currentPeriodEnd: user.billing?.subscription?.currentPeriodEnd || null,
      cancelAtPeriodEnd: user.billing?.subscription?.cancelAtPeriodEnd || false
    };

    res.json({
      success: true,
      message: 'Transaction statistics retrieved successfully',
      data: {
        statistics: stats,
        subscription
      }
    });

  } catch (error) {
    logger.error('Get transaction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transaction statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/transactions/:id
 * @desc    Get transaction details by ID
 * @access  Private
 */
router.get('/:id', validateObjectIdParam, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const transactionId = req.params.id;

    // Get user and find transaction
    const user = await User.findById(userId).select('billing.transactions');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const transaction = user.billing?.transactions?.find(
      t => t._id.toString() === transactionId
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      message: 'Transaction details retrieved successfully',
      data: transaction
    });

  } catch (error) {
    logger.error('Get transaction details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transaction details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/transactions
 * @desc    Create a new transaction (for testing/manual entry)
 * @access  Private
 */
router.post('/', validateTransaction, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const { type, amount, currency = 'USD', description, status = 'completed', paymentMethod } = req.body;

    // Create transaction object
    const transaction = {
      type,
      amount,
      currency,
      description,
      status,
      paymentMethod,
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add transaction to user billing history
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.billing) {
      user.billing = { transactions: [] };
    }

    if (!user.billing.transactions) {
      user.billing.transactions = [];
    }

    user.billing.transactions.push(transaction);
    await user.save();

    // Get the saved transaction (with _id)
    const savedTransaction = user.billing.transactions[user.billing.transactions.length - 1];

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: savedTransaction
    });

  } catch (error) {
    logger.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/transactions/export/csv
 * @desc    Export transactions as CSV
 * @access  Private
 */
router.get('/export/csv', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const { startDate, endDate } = req.query;

    // Get user transactions
    const user = await User.findById(userId).select('billing.transactions');
    let transactions = user.billing?.transactions || [];

    // Filter by date if provided
    if (startDate) {
      const start = new Date(startDate);
      transactions = transactions.filter(t => new Date(t.createdAt) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      transactions = transactions.filter(t => new Date(t.createdAt) <= end);
    }

    // Generate CSV
    const csv = generateTransactionCSV(transactions);

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="transactions-${Date.now()}.csv"`);
    res.send(csv);

  } catch (error) {
    logger.error('Export transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/transactions/receipt/:id
 * @desc    Get transaction receipt
 * @access  Private
 */
router.get('/receipt/:id', validateObjectIdParam, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const transactionId = req.params.id;

    // Get user and transaction
    const user = await User.findById(userId).select('billing.transactions name email');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const transaction = user.billing?.transactions?.find(
      t => t._id.toString() === transactionId
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Generate receipt
    const receipt = {
      receiptNumber: `RCP-${transaction.transactionId}`,
      transactionId: transaction.transactionId,
      date: transaction.createdAt,
      customer: {
        name: user.name,
        email: user.email
      },
      transaction: {
        type: transaction.type,
        description: transaction.description,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        paymentMethod: transaction.paymentMethod
      },
      company: {
        name: 'PassVault',
        address: '123 Security Street',
        city: 'Tech City, TC 12345',
        email: 'billing@passvault.com',
        website: 'www.passvault.com'
      }
    };

    res.json({
      success: true,
      message: 'Receipt generated successfully',
      data: receipt
    });

  } catch (error) {
    logger.error('Get receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate receipt',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Group transactions by month
 */
function getTransactionsByMonth(transactions) {
  const byMonth = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!byMonth[monthKey]) {
      byMonth[monthKey] = {
        month: monthKey,
        count: 0,
        amount: 0,
        completed: 0,
        failed: 0
      };
    }
    
    byMonth[monthKey].count++;
    
    if (transaction.status === 'completed') {
      byMonth[monthKey].amount += transaction.amount || 0;
      byMonth[monthKey].completed++;
    } else if (transaction.status === 'failed') {
      byMonth[monthKey].failed++;
    }
  });
  
  return Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Generate CSV from transactions
 */
function generateTransactionCSV(transactions) {
  const headers = ['Transaction ID', 'Date', 'Type', 'Description', 'Amount', 'Currency', 'Status', 'Payment Method'];
  const rows = [headers.join(',')];
  
  transactions.forEach(transaction => {
    const row = [
      transaction.transactionId || '',
      new Date(transaction.createdAt).toISOString().split('T')[0],
      transaction.type || '',
      `"${(transaction.description || '').replace(/"/g, '""')}"`,
      transaction.amount || 0,
      transaction.currency || 'USD',
      transaction.status || '',
      transaction.paymentMethod || ''
    ];
    rows.push(row.join(','));
  });
  
  return rows.join('\n');
}

export default router;
