import express from 'express';
import Alert from '../models/Alert.js';
import { authenticateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Helper function to check and create expiration alerts
const autoCheckExpirations = async (userId) => {
  try {
    console.log('🔄 [Auto-check] Running automatic expiration check for user:', userId);
    
    const QRCode = (await import('../models/QRCode.js')).default;
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const qrCodes = await QRCode.find({
      userId: userId,
      isActive: true
    });

    console.log('📦 [Auto-check] Found', qrCodes.length, 'active QR codes/cards');
    let alertsCreated = 0;

    for (const qr of qrCodes) {
      let expiryDate = null;
      let cardType = 'item';
      let parsedData = {}; // Initialize parsedData outside the if block
      let expiryFormatted = null; // Store MM/YY format

      if (qr.data && typeof qr.data === 'object') {
        parsedData = qr.data;
        if (qr.data.text && typeof qr.data.text === 'string') {
          try {
            parsedData = JSON.parse(qr.data.text);
          } catch (e) {
            parsedData = qr.data;
          }
        }

        if (parsedData.expiry) {
          expiryFormatted = parsedData.expiry; // Store MM/YY format
          const expiryParts = parsedData.expiry.split('/');
          if (expiryParts.length === 2) {
            const month = parseInt(expiryParts[0], 10);
            const year = parseInt('20' + expiryParts[1], 10);
            expiryDate = new Date(year, month, 0);
          }
        } else if (qr.data.expiry) {
          expiryFormatted = qr.data.expiry; // Store MM/YY format
          const expiryParts = qr.data.expiry.split('/');
          if (expiryParts.length === 2) {
            const month = parseInt(expiryParts[0], 10);
            const year = parseInt('20' + expiryParts[1], 10);
            expiryDate = new Date(year, month, 0);
          }
        }

        if (parsedData.type) {
          cardType = parsedData.type.toLowerCase();
        } else if (qr.data.type) {
          cardType = qr.data.type.toLowerCase();
        } else if (qr.category) {
          cardType = qr.category.toLowerCase();
        } else if (qr.qrType) {
          cardType = qr.qrType.toLowerCase();
        }
      }

      if (!expiryDate && qr.expiresAt) {
        expiryDate = new Date(qr.expiresAt);
      }

      if (expiryDate && expiryDate <= thirtyDaysFromNow) {
        const existingAlert = await Alert.findOne({
          userId: userId,
          relatedTo: 'qrcode',
          relatedId: qr._id,
          isResolved: false
        });

        if (!existingAlert) {
          const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
          const isCard = ['credit', 'debit'].includes(cardType);
          const alertType = isCard ? 'card_expiry' : 'pass_expiry';
          const icon = isCard ? '💳' : '🎫';

          let severity = 'low';
          let title = '';
          let message = '';

          if (daysUntilExpiry <= 0) {
            severity = 'critical';
            const daysAgo = Math.abs(daysUntilExpiry);
            title = `${icon} ${qr.title} EXPIRED`;
            message = `Your ${cardType} "${qr.title}" expired ${daysAgo === 0 ? 'today' : `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`} on ${expiryDate.toLocaleDateString()}. Immediate renewal required!`;
          } else if (daysUntilExpiry <= 7) {
            severity = 'high';
            title = `${icon} ${qr.title} Expiring Very Soon`;
            message = `Your ${cardType} "${qr.title}" will expire in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'} on ${expiryDate.toLocaleDateString()}`;
          } else if (daysUntilExpiry <= 14) {
            severity = 'medium';
            title = `${icon} ${qr.title} Expiring Soon`;
            message = `Your ${cardType} "${qr.title}" will expire in ${daysUntilExpiry} days on ${expiryDate.toLocaleDateString()}`;
          } else {
            severity = 'low';
            title = `${icon} ${qr.title} Expiring Soon`;
            message = `Your ${cardType} "${qr.title}" will expire in ${daysUntilExpiry} days on ${expiryDate.toLocaleDateString()}`;
          }

          const alert = new Alert({
            userId: userId,
            alertType,
            severity,
            title,
            message,
            relatedTo: 'qrcode',
            relatedId: qr._id,
            actionRequired: true,
            actionUrl: `/features/qr-scan`,
            actionLabel: daysUntilExpiry <= 0 ? 'Renew Now' : 'View Card',
            expiryDate: expiryDate,
            metadata: {
              cardType,
              isCard,
              qrTitle: qr.title,
              daysUntilExpiry,
              category: qr.category,
              // Add expiry date string for display
              expiryDateString: expiryDate.toLocaleDateString(),
              // Add formatted expiry (MM/YY) if available from parsed data
              expiryFormatted: expiryFormatted
            }
          });

          await alert.save();
          alertsCreated++;
          console.log('✅ [Auto-check] Created alert for:', qr.title, '- Severity:', severity);
        }
      }
    }

    console.log(`✅ [Auto-check] Completed. Created ${alertsCreated} new alerts`);
    return alertsCreated;
  } catch (error) {
    console.error('❌ [Auto-check] Error:', error);
    return 0;
  }
};

// @route   GET /api/alerts
// @desc    Get all alerts for user (with automatic expiration check)
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    // First, automatically check for any new expirations
    await autoCheckExpirations(req.user.userId);

    const {
      alertType,
      severity,
      isRead,
      isResolved,
      sortBy = '-createdAt',
      page = 1,
      limit = 20
    } = req.query;

    const query = { userId: req.user.userId };

    if (alertType) query.alertType = alertType;
    if (severity) query.severity = severity;
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (isResolved !== undefined) query.isResolved = isResolved === 'true';

    const alerts = await Alert.find(query)
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Alert.countDocuments(query);

    res.json({
      success: true,
      alerts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(count / limit),
        total: count
      }
    });

  } catch (error) {
    logger.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts',
      error: error.message
    });
  }
});

// @route   GET /api/alerts/unread
// @desc    Get unread alerts
// @access  Private
router.get('/unread', authenticateToken, async (req, res) => {
  try {
    const alerts = await Alert.find({
      userId: req.user.userId,
      isRead: false
    })
      .sort('-createdAt')
      .limit(50)
      .lean();

    const unreadCount = await Alert.getUnreadCount(req.user.userId);

    res.json({
      success: true,
      alerts,
      unreadCount
    });

  } catch (error) {
    logger.error('Error fetching unread alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread alerts',
      error: error.message
    });
  }
});

// @route   GET /api/alerts/critical
// @desc    Get critical alerts
// @access  Private
router.get('/critical', authenticateToken, async (req, res) => {
  try {
    const alerts = await Alert.getCriticalAlerts(req.user.userId);

    res.json({
      success: true,
      alerts,
      count: alerts.length
    });

  } catch (error) {
    logger.error('Error fetching critical alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching critical alerts',
      error: error.message
    });
  }
});

// @route   POST /api/alerts
// @desc    Create a new alert (system use)
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      alertType,
      severity,
      title,
      message,
      relatedTo,
      relatedId,
      actionRequired,
      actionUrl,
      actionLabel,
      expiryDate,
      metadata
    } = req.body;

    if (!alertType || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Alert type, title, and message are required'
      });
    }

    const alert = new Alert({
      userId: req.user.userId,
      alertType,
      severity: severity || 'medium',
      title,
      message,
      relatedTo,
      relatedId,
      actionRequired: actionRequired || false,
      actionUrl,
      actionLabel,
      expiryDate,
      metadata: metadata || {}
    });

    await alert.save();

    logger.info(`Alert created: ${alert._id} for user ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      alert
    });

  } catch (error) {
    logger.error('Alert creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating alert',
      error: error.message
    });
  }
});

// @route   PUT /api/alerts/:id/read
// @desc    Mark alert as read
// @access  Private
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const alert = await Alert.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    await alert.markAsRead();

    res.json({
      success: true,
      message: 'Alert marked as read',
      alert
    });

  } catch (error) {
    logger.error('Error marking alert as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking alert as read',
      error: error.message
    });
  }
});

// @route   PUT /api/alerts/:id/resolve
// @desc    Resolve alert
// @access  Private
router.put('/:id/resolve', authenticateToken, async (req, res) => {
  try {
    const alert = await Alert.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    await alert.resolve('user');

    res.json({
      success: true,
      message: 'Alert resolved',
      alert
    });

  } catch (error) {
    logger.error('Error resolving alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error resolving alert',
      error: error.message
    });
  }
});

// @route   DELETE /api/alerts/:id
// @desc    Delete alert
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const alert = await Alert.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    await alert.deleteOne();

    logger.info(`Alert deleted: ${alert._id}`);

    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting alert',
      error: error.message
    });
  }
});

// @route   PUT /api/alerts/mark-all-read
// @desc    Mark all alerts as read
// @access  Private
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const result = await Alert.updateMany(
      { userId: req.user.userId, isRead: false },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: 'All alerts marked as read',
      updated: result.modifiedCount
    });

  } catch (error) {
    logger.error('Error marking all alerts as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all alerts as read',
      error: error.message
    });
  }
});

// @route   GET /api/alerts/stats/overview
// @desc    Get alert statistics
// @access  Private
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const stats = await Alert.aggregate([
      { $match: { userId: req.user.userId } },
      {
        $facet: {
          totalStats: [
            {
              $group: {
                _id: null,
                totalAlerts: { $sum: 1 },
                unreadAlerts: {
                  $sum: { $cond: ['$isRead', 0, 1] }
                },
                unresolvedAlerts: {
                  $sum: { $cond: ['$isResolved', 0, 1] }
                },
                criticalAlerts: {
                  $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
                }
              }
            }
          ],
          severityBreakdown: [
            {
              $group: {
                _id: '$severity',
                count: { $sum: 1 }
              }
            }
          ],
          typeBreakdown: [
            {
              $group: {
                _id: '$alertType',
                count: { $sum: 1 }
              }
            }
          ],
          recentAlerts: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                title: 1,
                severity: 1,
                alertType: 1,
                createdAt: 1,
                isRead: 1
              }
            }
          ],
          actionRequired: [
            { $match: { actionRequired: true, isResolved: false } },
            { $sort: { createdAt: -1 } },
            {
              $project: {
                title: 1,
                severity: 1,
                actionUrl: 1,
                actionLabel: 1
              }
            }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats[0]
    });

  } catch (error) {
    logger.error('Error fetching alert stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// @route   POST /api/alerts/check-expirations
// @desc    Check for card/pass/password/document expirations and create alerts
// @access  Private
router.post('/check-expirations', authenticateToken, async (req, res) => {
  try {
    // Import models dynamically
    const QRCode = (await import('../models/QRCode.js')).default;
    const Password = (await import('../models/Password.js')).default;
    const SecureDocument = (await import('../models/SecureDocument.js')).default;

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const alertsCreated = [];

    // Check for expiring cards and passes
    console.log('🔍 [Backend] Checking expirations for user:', req.user.userId);
    const qrCodes = await QRCode.find({
      userId: req.user.userId,
      isActive: true
    });
    console.log('📦 [Backend] Found', qrCodes.length, 'active QR codes/cards');

    for (const qr of qrCodes) {
      console.log('🎫 [Backend] Processing:', qr.title);
      let expiryDate = null;
      let cardType = 'item';
      let parsedData = {}; // Initialize parsedData outside the if block
      let expiryFormatted = null; // Store MM/YY format

      // Parse expiry date from data field
      if (qr.data && typeof qr.data === 'object') {
        // First check if there's a 'text' field with JSON string (for text-type QR codes)
        parsedData = qr.data;
        if (qr.data.text && typeof qr.data.text === 'string') {
          try {
            parsedData = JSON.parse(qr.data.text);
            console.log('📝 [Backend] Parsed text data for', qr.title, ':', parsedData);
          } catch (e) {
            console.warn('⚠️  [Backend] Failed to parse text field for', qr.title);
            parsedData = qr.data;
          }
        }

        // Check for expiry field in parsed data
        if (parsedData.expiry) {
          expiryFormatted = parsedData.expiry; // Store MM/YY format
          // Parse MM/YY format
          const expiryParts = parsedData.expiry.split('/');
          if (expiryParts.length === 2) {
            const month = parseInt(expiryParts[0], 10);
            const year = parseInt('20' + expiryParts[1], 10);
            // Set to last day of expiry month
            expiryDate = new Date(year, month, 0);
            console.log('📅 [Backend] Parsed expiry from data:', parsedData.expiry, '→', expiryDate.toLocaleDateString());
          }
        } else if (qr.data.expiry) {
          expiryFormatted = qr.data.expiry; // Store MM/YY format
          // Fallback to direct data.expiry field
          const expiryParts = qr.data.expiry.split('/');
          if (expiryParts.length === 2) {
            const month = parseInt(expiryParts[0], 10);
            const year = parseInt('20' + expiryParts[1], 10);
            expiryDate = new Date(year, month, 0);
            console.log('📅 [Backend] Parsed expiry from data.expiry:', qr.data.expiry, '→', expiryDate.toLocaleDateString());
          }
        }

        // Determine card type from parsed data
        if (parsedData.type) {
          cardType = parsedData.type.toLowerCase();
        } else if (qr.data.type) {
          cardType = qr.data.type.toLowerCase();
        } else if (qr.category) {
          cardType = qr.category.toLowerCase();
        } else if (qr.qrType) {
          cardType = qr.qrType.toLowerCase();
        }
      }

      // Also check expiresAt field
      if (!expiryDate && qr.expiresAt) {
        expiryDate = new Date(qr.expiresAt);
      }

      // If expiry date exists (check both expired and expiring items)
      if (expiryDate) {
        const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
        console.log('📅 [Backend]', qr.title, '- Expiry:', expiryDate.toLocaleDateString(), '- Days until expiry:', daysUntilExpiry);

        // Include items that are expired (past date) OR expiring within 30 days
        if (expiryDate <= thirtyDaysFromNow) {
          // Check if alert already exists for this item
          const existingAlert = await Alert.findOne({
            userId: req.user.userId,
            relatedTo: 'qrcode',
            relatedId: qr._id,
            isResolved: false
          });

          if (!existingAlert) {
            const isCard = ['credit', 'debit'].includes(cardType);
            const alertType = isCard ? 'card_expiry' : 'pass_expiry';
            const icon = isCard ? '💳' : '🎫';

            // Determine severity based on days until expiry
            let severity = 'low';
            let title = '';
            let message = '';

            if (daysUntilExpiry <= 0) {
              // Already expired
              severity = 'critical';
              const daysAgo = Math.abs(daysUntilExpiry);
              title = `${icon} ${qr.title} EXPIRED`;
              message = `Your ${cardType} "${qr.title}" expired ${daysAgo === 0 ? 'today' : `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`} on ${expiryDate.toLocaleDateString()}. Immediate renewal required!`;
            } else if (daysUntilExpiry <= 7) {
              severity = 'high';
              title = `${icon} ${qr.title} Expiring Very Soon`;
              message = `Your ${cardType} "${qr.title}" will expire in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'} on ${expiryDate.toLocaleDateString()}`;
            } else if (daysUntilExpiry <= 14) {
              severity = 'medium';
              title = `${icon} ${qr.title} Expiring Soon`;
              message = `Your ${cardType} "${qr.title}" will expire in ${daysUntilExpiry} days on ${expiryDate.toLocaleDateString()}`;
            } else {
              severity = 'low';
              title = `${icon} ${qr.title} Expiring Soon`;
              message = `Your ${cardType} "${qr.title}" will expire in ${daysUntilExpiry} days on ${expiryDate.toLocaleDateString()}`;
            }

            const alert = new Alert({
              userId: req.user.userId,
              alertType,
              severity,
              title,
              message,
              relatedTo: 'qrcode',
              relatedId: qr._id,
              actionRequired: true,
              actionUrl: `/features/qr-scan`,
              actionLabel: daysUntilExpiry <= 0 ? 'Renew Now' : 'View Card',
              expiryDate: expiryDate,
              metadata: {
                cardType,
                isCard,
                qrTitle: qr.title,
                daysUntilExpiry,
                category: qr.category,
                expiryDateString: expiryDate.toLocaleDateString(),
                expiryFormatted: expiryFormatted
              }
            });

            await alert.save();
            alertsCreated.push(alert);
            console.log('✅ [Backend] Created alert:', title, '- Severity:', severity);
          }
        }
      }
    }

    // Check for expiring passwords (if models exist)
    try {
      const expiringPasswords = await Password.find({
        userId: req.user.userId,
        expiresAt: {
          $gte: now,
          $lte: thirtyDaysFromNow
        }
      });

      for (const password of expiringPasswords) {
        const daysUntilExpiry = Math.ceil((password.expiresAt - now) / (1000 * 60 * 60 * 24));

        const existingAlert = await Alert.findOne({
          userId: req.user.userId,
          relatedTo: 'password',
          relatedId: password._id,
          isResolved: false
        });

        if (!existingAlert) {
          const alert = new Alert({
            userId: req.user.userId,
            alertType: 'password_expiry',
            severity: daysUntilExpiry <= 7 ? 'high' : 'medium',
            title: 'Password Expiring Soon',
            message: `Your password for "${password.title}" will expire in ${daysUntilExpiry} days`,
            relatedTo: 'password',
            relatedId: password._id,
            actionRequired: true,
            actionUrl: `/dashboard/passwords/${password._id}`,
            actionLabel: 'Update Password',
            expiryDate: password.expiresAt
          });

          await alert.save();
          alertsCreated.push(alert);
        }
      }
    } catch (err) {
      // Password model might not exist
      logger.info('Password model not available');
    }

    // Check for expiring documents (if models exist)
    try {
      const expiringDocuments = await SecureDocument.find({
        userId: req.user.userId,
        expiresAt: {
          $gte: now,
          $lte: thirtyDaysFromNow
        }
      });

      for (const document of expiringDocuments) {
        const daysUntilExpiry = Math.ceil((document.expiresAt - now) / (1000 * 60 * 60 * 24));

        const existingAlert = await Alert.findOne({
          userId: req.user.userId,
          relatedTo: 'document',
          relatedId: document._id,
          isResolved: false
        });

        if (!existingAlert) {
          const alert = new Alert({
            userId: req.user.userId,
            alertType: 'document_expiry',
            severity: daysUntilExpiry <= 7 ? 'high' : 'medium',
            title: 'Document Expiring Soon',
            message: `Your document "${document.originalName}" will expire in ${daysUntilExpiry} days`,
            relatedTo: 'document',
            relatedId: document._id,
            actionRequired: true,
            actionUrl: `/dashboard/documents/${document._id}`,
            actionLabel: 'Renew Document',
            expiryDate: document.expiresAt
          });

          await alert.save();
          alertsCreated.push(alert);
        }
      }
    } catch (err) {
      // SecureDocument model might not exist
      logger.info('SecureDocument model not available');
    }

    res.json({
      success: true,
      message: 'Expiration check completed',
      alertsCreated: alertsCreated.length
    });

  } catch (error) {
    logger.error('Error checking expirations:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking expirations',
      error: error.message
    });
  }
});

export default router;
