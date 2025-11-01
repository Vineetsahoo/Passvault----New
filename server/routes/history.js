import express from 'express';
import mongoose from 'mongoose';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { validateHistoryQuery, handleValidationErrors } from '../utils/validation.js';
import Password from '../models/Password.js';
import SecureDocument from '../models/SecureDocument.js';
import QRCode from '../models/QRCode.js';
import Backup from '../models/Backup.js';
import User from '../models/User.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/history
 * @desc    Get activity history with filtering and pagination
 * @access  Private
 */
router.get('/', validateHistoryQuery, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      type = 'all',
      startDate,
      endDate,
      sortBy = '-createdAt'
    } = req.query;

    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const skip = (page - 1) * limit;

    // Date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }

    const historyItems = [];

    // Fetch password activities
    if (type === 'all' || type === 'password') {
      const passwords = await Password.find({
        userId,
        ...(Object.keys(dateFilter).length && { createdAt: dateFilter })
      })
        .select('title website createdAt updatedAt')
        .sort(sortBy)
        .lean();

      passwords.forEach(password => {
        historyItems.push({
          id: password._id,
          type: 'password',
          action: 'created',
          title: password.title,
          description: `Password created for ${password.website || password.title}`,
          timestamp: password.createdAt,
          metadata: {
            website: password.website
          }
        });

        if (password.updatedAt > password.createdAt) {
          historyItems.push({
            id: password._id,
            type: 'password',
            action: 'updated',
            title: password.title,
            description: `Password updated for ${password.website || password.title}`,
            timestamp: password.updatedAt,
            metadata: {
              website: password.website
            }
          });
        }
      });
    }

    // Fetch document activities
    if (type === 'all' || type === 'document') {
      const documents = await SecureDocument.find({
        userId,
        ...(Object.keys(dateFilter).length && { createdAt: dateFilter })
      })
        .select('originalName category createdAt updatedAt')
        .sort(sortBy)
        .lean();

      documents.forEach(document => {
        historyItems.push({
          id: document._id,
          type: 'document',
          action: 'uploaded',
          title: document.originalName,
          description: `Document "${document.originalName}" uploaded`,
          timestamp: document.createdAt,
          metadata: {
            category: document.category
          }
        });
      });
    }

    // Fetch QR code activities
    if (type === 'all' || type === 'qrcode') {
      const qrcodes = await QRCode.find({
        userId,
        ...(Object.keys(dateFilter).length && { createdAt: dateFilter })
      })
        .select('title type createdAt scannedAt scanCount')
        .sort(sortBy)
        .lean();

      qrcodes.forEach(qrcode => {
        historyItems.push({
          id: qrcode._id,
          type: 'qrcode',
          action: 'created',
          title: qrcode.title,
          description: `QR code "${qrcode.title}" created`,
          timestamp: qrcode.createdAt,
          metadata: {
            type: qrcode.type,
            scanCount: qrcode.scanCount
          }
        });

        if (qrcode.scannedAt) {
          historyItems.push({
            id: qrcode._id,
            type: 'qrcode',
            action: 'scanned',
            title: qrcode.title,
            description: `QR code "${qrcode.title}" scanned`,
            timestamp: qrcode.scannedAt,
            metadata: {
              type: qrcode.type,
              scanCount: qrcode.scanCount
            }
          });
        }
      });
    }

    // Fetch backup activities
    if (type === 'all' || type === 'backup') {
      const backups = await Backup.find({
        userId,
        ...(Object.keys(dateFilter).length && { createdAt: dateFilter })
      })
        .select('type status createdAt completedAt')
        .sort(sortBy)
        .lean();

      backups.forEach(backup => {
        historyItems.push({
          id: backup._id,
          type: 'backup',
          action: backup.status === 'completed' ? 'created' : 'initiated',
          title: `${backup.type} Backup`,
          description: `${backup.type} backup ${backup.status}`,
          timestamp: backup.createdAt,
          metadata: {
            backupType: backup.type,
            status: backup.status
          }
        });
      });
    }

    // Fetch login activities
    if (type === 'all' || type === 'login') {
      const user = await User.findById(userId).select('profile.security.loginHistory');
      
      if (user && user.profile.security.loginHistory) {
        user.profile.security.loginHistory.forEach(login => {
          if (!startDate || new Date(login.timestamp) >= new Date(startDate)) {
            if (!endDate || new Date(login.timestamp) <= new Date(endDate)) {
              historyItems.push({
                id: login._id,
                type: 'login',
                action: login.status === 'success' ? 'login_success' : 'login_failed',
                title: 'Login Attempt',
                description: `${login.status === 'success' ? 'Successful' : 'Failed'} login from ${login.device}`,
                timestamp: login.timestamp,
                metadata: {
                  device: login.device,
                  browser: login.browser,
                  location: login.location,
                  status: login.status
                }
              });
            }
          }
        });
      }
    }

    // Sort all history items by timestamp
    historyItems.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortBy.startsWith('-') ? timeB - timeA : timeA - timeB;
    });

    // Apply pagination
    const paginatedItems = historyItems.slice(skip, skip + parseInt(limit));
    const totalItems = historyItems.length;

    // Calculate statistics
    const stats = {
      total: totalItems,
      byType: {
        password: historyItems.filter(item => item.type === 'password').length,
        document: historyItems.filter(item => item.type === 'document').length,
        qrcode: historyItems.filter(item => item.type === 'qrcode').length,
        backup: historyItems.filter(item => item.type === 'backup').length,
        login: historyItems.filter(item => item.type === 'login').length,
        settings: historyItems.filter(item => item.type === 'settings').length
      },
      byAction: {
        created: historyItems.filter(item => item.action === 'created').length,
        updated: historyItems.filter(item => item.action === 'updated').length,
        deleted: historyItems.filter(item => item.action === 'deleted').length,
        accessed: historyItems.filter(item => item.action.includes('login') || item.action === 'scanned').length
      }
    };

    res.json({
      success: true,
      message: 'Activity history retrieved successfully',
      data: {
        history: paginatedItems,
        stats,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(totalItems / limit),
          total: totalItems,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    logger.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve activity history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/history/timeline
 * @desc    Get activity timeline grouped by date
 * @access  Private
 */
router.get('/timeline', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Aggregate activities by date
    const timeline = {};

    // Get password activities
    const passwords = await Password.find({
      userId,
      createdAt: { $gte: startDate }
    }).select('title createdAt').lean();

    passwords.forEach(password => {
      const date = password.createdAt.toISOString().split('T')[0];
      if (!timeline[date]) timeline[date] = [];
      timeline[date].push({
        type: 'password',
        action: 'created',
        title: password.title,
        timestamp: password.createdAt
      });
    });

    // Get document activities
    const documents = await SecureDocument.find({
      userId,
      createdAt: { $gte: startDate }
    }).select('originalName createdAt').lean();

    documents.forEach(document => {
      const date = document.createdAt.toISOString().split('T')[0];
      if (!timeline[date]) timeline[date] = [];
      timeline[date].push({
        type: 'document',
        action: 'uploaded',
        title: document.originalName,
        timestamp: document.createdAt
      });
    });

    // Get backup activities
    const backups = await Backup.find({
      userId,
      createdAt: { $gte: startDate }
    }).select('type createdAt status').lean();

    backups.forEach(backup => {
      const date = backup.createdAt.toISOString().split('T')[0];
      if (!timeline[date]) timeline[date] = [];
      timeline[date].push({
        type: 'backup',
        action: 'created',
        title: `${backup.type} Backup`,
        timestamp: backup.createdAt
      });
    });

    // Convert to array and sort
    const timelineArray = Object.entries(timeline).map(([date, activities]) => ({
      date,
      activities: activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
      count: activities.length
    })).sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      message: 'Activity timeline retrieved successfully',
      data: {
        timeline: timelineArray,
        totalActivities: timelineArray.reduce((sum, day) => sum + day.count, 0)
      }
    });

  } catch (error) {
    logger.error('Get timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve activity timeline',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/history/stats
 * @desc    Get activity statistics
 * @access  Private
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    // Get counts
    const [passwordCount, documentCount, qrcodeCount, backupCount] = await Promise.all([
      Password.countDocuments({ userId }),
      SecureDocument.countDocuments({ userId }),
      QRCode.countDocuments({ userId }),
      Backup.countDocuments({ userId })
    ]);

    // Get recent activity (last 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const [recentPasswords, recentDocuments, recentQRCodes, recentBackups] = await Promise.all([
      Password.countDocuments({ userId, createdAt: { $gte: last7Days } }),
      SecureDocument.countDocuments({ userId, createdAt: { $gte: last7Days } }),
      QRCode.countDocuments({ userId, createdAt: { $gte: last7Days } }),
      Backup.countDocuments({ userId, createdAt: { $gte: last7Days } })
    ]);

    // Get most active day
    const passwords = await Password.find({ userId }).select('createdAt').lean();
    const activityByDay = {};
    passwords.forEach(p => {
      const day = p.createdAt.toISOString().split('T')[0];
      activityByDay[day] = (activityByDay[day] || 0) + 1;
    });

    const mostActiveDay = Object.entries(activityByDay)
      .sort((a, b) => b[1] - a[1])[0];

    res.json({
      success: true,
      message: 'Activity statistics retrieved successfully',
      data: {
        totalActivity: {
          passwords: passwordCount,
          documents: documentCount,
          qrcodes: qrcodeCount,
          backups: backupCount,
          total: passwordCount + documentCount + qrcodeCount + backupCount
        },
        recentActivity: {
          passwords: recentPasswords,
          documents: recentDocuments,
          qrcodes: recentQRCodes,
          backups: recentBackups,
          total: recentPasswords + recentDocuments + recentQRCodes + recentBackups
        },
        mostActiveDay: mostActiveDay ? {
          date: mostActiveDay[0],
          activities: mostActiveDay[1]
        } : null
      }
    });

  } catch (error) {
    logger.error('Get history stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve activity statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/history
 * @desc    Clear activity history (soft delete - archives data)
 * @access  Private
 */
router.delete('/', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const { type = 'all', olderThan } = req.body;

    const filter = { userId };
    if (olderThan) {
      filter.createdAt = { $lt: new Date(olderThan) };
    }

    let deletedCount = 0;

    // Archive based on type
    if (type === 'all' || type === 'password') {
      const result = await Password.updateMany(filter, { $set: { isArchived: true } });
      deletedCount += result.modifiedCount;
    }

    if (type === 'all' || type === 'document') {
      const result = await SecureDocument.updateMany(filter, { $set: { isArchived: true } });
      deletedCount += result.modifiedCount;
    }

    if (type === 'all' || type === 'qrcode') {
      const result = await QRCode.updateMany(filter, { $set: { isArchived: true } });
      deletedCount += result.modifiedCount;
    }

    logger.info(`History archived for user: ${req.user.userId}, items: ${deletedCount}`);

    res.json({
      success: true,
      message: 'Activity history archived successfully',
      data: {
        archivedItems: deletedCount
      }
    });

  } catch (error) {
    logger.error('Archive history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive activity history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
