import express from 'express';
import crypto from 'crypto';
import SharedPass from '../models/SharedPass.js';
import ShareTemplate from '../models/ShareTemplate.js';
import ShareLog from '../models/ShareLog.js';
import QRCode from '../models/QRCode.js';
import User from '../models/User.js';
import { body, param, query, validationResult } from 'express-validator';
import { authenticateToken as auth } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// ============================================
// SHARED PASSES ENDPOINTS
// ============================================

/**
 * @route   POST /api/sharing/share
 * @desc    Share a pass with someone
 * @access  Private
 */
router.post('/share',
  auth,
  [
    body('passId').isMongoId().withMessage('Invalid pass ID'),
    body('recipientEmail').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('recipientName').optional().trim().isLength({ min: 1, max: 100 }),
    body('accessLevel').isIn(['read', 'edit']).withMessage('Access level must be read or edit'),
    body('expiryDays').optional().isInt({ min: 1, max: 365 }).withMessage('Expiry days must be 1-365'),
    body('restrictions').optional().isArray(),
    body('templateId').optional().isMongoId()
  ],
  validate,
  async (req, res) => {
    try {
      const { passId, recipientEmail, recipientName, accessLevel, expiryDays, restrictions, templateId, message } = req.body;

      // Check if pass exists and belongs to user
      const pass = await QRCode.findOne({ _id: passId, userId: req.user.userId });
      if (!pass) {
        return res.status(404).json({
          success: false,
          message: 'Pass not found or you do not have permission'
        });
      }

      // Check if already shared with this email
      const existingShare = await SharedPass.findOne({
        owner: req.user.userId,
        pass: passId,
        'recipient.email': recipientEmail,
        status: { $in: ['pending', 'active'] }
      });

      if (existingShare) {
        return res.status(400).json({
          success: false,
          message: 'Pass already shared with this email'
        });
      }

      // Check for recipient user
      const recipientUser = await User.findOne({ email: recipientEmail });

      // Calculate expiry date
      let expiresAt = null;
      if (expiryDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiryDays);
      }

      // Get template if provided
      let template = null;
      if (templateId) {
        template = await ShareTemplate.findOne({ _id: templateId, owner: req.user.userId });
        if (template) {
          await template.incrementUsage();
        }
      }

      // Create shared pass
      const sharedPass = new SharedPass({
        owner: req.user.userId,
        pass: passId,
        recipient: {
          email: recipientEmail,
          userId: recipientUser?._id || null,
          name: recipientName || recipientUser?.name || ''
        },
        accessLevel,
        status: 'pending',
        restrictions: restrictions || [],
        template: templateId || null,
        expiresAt,
        shareMethod: 'email'
      });

      await sharedPass.save();

      // Create activity log
      await ShareLog.createLog({
        sharedPass: sharedPass._id,
        owner: req.user.userId,
        action: 'shared',
        recipient: {
          email: recipientEmail,
          userId: recipientUser?._id || null
        },
        performedBy: {
          userId: req.user.userId,
          name: req.user.name,
          email: req.user.email
        },
        details: {
          reason: message || 'Pass shared',
          changes: [`Access level: ${accessLevel}`, `Expires: ${expiresAt ? expiresAt.toLocaleDateString() : 'Never'}`]
        },
        metadata: {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        }
      });

      // TODO: Send email notification to recipient
      // await sendShareNotification(recipientEmail, pass, sharedPass);

      res.status(201).json({
        success: true,
        message: 'Pass shared successfully',
        data: {
          sharedPass: await sharedPass.populate('pass', 'title type cardNumber')
        }
      });

    } catch (error) {
      console.error('Share pass error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to share pass',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/sharing/batch-share
 * @desc    Share pass with multiple recipients
 * @access  Private
 */
router.post('/batch-share',
  auth,
  [
    body('passId').isMongoId().withMessage('Invalid pass ID'),
    body('recipients').isArray({ min: 1, max: 50 }).withMessage('Recipients must be array (1-50)'),
    body('recipients.*.email').isEmail().normalizeEmail(),
    body('recipients.*.name').optional().trim(),
    body('templateId').optional().isMongoId(),
    body('accessLevel').isIn(['read', 'edit']),
    body('expiryDays').optional().isInt({ min: 1, max: 365 })
  ],
  validate,
  async (req, res) => {
    try {
      const { passId, recipients, templateId, accessLevel, expiryDays } = req.body;

      // Check if pass exists
      const pass = await QRCode.findOne({ _id: passId, userId: req.user.userId });
      if (!pass) {
        return res.status(404).json({
          success: false,
          message: 'Pass not found'
        });
      }

      // Get template if provided
      let template = null;
      if (templateId) {
        template = await ShareTemplate.findOne({ _id: templateId, owner: req.user.userId });
      }

      // Calculate expiry
      let expiresAt = null;
      if (expiryDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiryDays);
      }

      const results = {
        success: [],
        failed: []
      };

      // Process each recipient
      for (const recipient of recipients) {
        try {
          // Check if already shared
          const existing = await SharedPass.findOne({
            owner: req.user.userId,
            pass: passId,
            'recipient.email': recipient.email,
            status: { $in: ['pending', 'active'] }
          });

          if (existing) {
            results.failed.push({
              email: recipient.email,
              reason: 'Already shared'
            });
            continue;
          }

          // Find recipient user
          const recipientUser = await User.findOne({ email: recipient.email });

          // Create share
          const sharedPass = new SharedPass({
            owner: req.user.userId,
            pass: passId,
            recipient: {
              email: recipient.email,
              userId: recipientUser?._id || null,
              name: recipient.name || recipientUser?.name || ''
            },
            accessLevel: template?.accessLevel || accessLevel,
            restrictions: template?.restrictions || [],
            template: templateId || null,
            expiresAt,
            shareMethod: 'batch'
          });

          await sharedPass.save();

          // Log activity
          await ShareLog.createLog({
            sharedPass: sharedPass._id,
            owner: req.user.userId,
            action: 'shared',
            recipient: {
              email: recipient.email,
              userId: recipientUser?._id || null
            },
            performedBy: {
              userId: req.user.userId,
              name: req.user.name,
              email: req.user.email
            },
            details: {
              reason: 'Batch share',
              changes: [`Access: ${accessLevel}`]
            }
          });

          results.success.push({
            email: recipient.email,
            sharedPassId: sharedPass._id
          });

        } catch (err) {
          results.failed.push({
            email: recipient.email,
            reason: err.message
          });
        }
      }

      res.status(200).json({
        success: true,
        message: `Shared with ${results.success.length} of ${recipients.length} recipients`,
        data: results
      });

    } catch (error) {
      console.error('Batch share error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to batch share',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/sharing/generate-link
 * @desc    Generate shareable link for a pass
 * @access  Private
 */
router.post('/generate-link',
  auth,
  [
    body('passId').isMongoId(),
    body('accessLevel').isIn(['read', 'edit']),
    body('expiryHours').optional().isInt({ min: 1, max: 720 }), // Max 30 days
    body('maxUses').optional().isInt({ min: 1, max: 100 })
  ],
  validate,
  async (req, res) => {
    try {
      const { passId, accessLevel, expiryHours = 24, maxUses = null } = req.body;

      // Verify pass ownership
      const pass = await QRCode.findOne({ _id: passId, userId: req.user.userId });
      if (!pass) {
        return res.status(404).json({
          success: false,
          message: 'Pass not found'
        });
      }

      // Generate unique token
      const token = crypto.randomBytes(32).toString('hex');

      // Calculate expiry
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiryHours);

      // Create shared pass with link
      const sharedPass = new SharedPass({
        owner: req.user.userId,
        pass: passId,
        recipient: {
          email: 'link-share@temp.com', // Placeholder
          name: 'Link Share'
        },
        accessLevel,
        status: 'active',
        shareMethod: 'link',
        shareLink: {
          token,
          expiresAt,
          maxUses,
          usedCount: 0
        },
        expiresAt
      });

      await sharedPass.save();

      // Create log
      await ShareLog.createLog({
        sharedPass: sharedPass._id,
        owner: req.user.userId,
        action: 'shared',
        recipient: {
          email: 'link-share@temp.com'
        },
        performedBy: {
          userId: req.user.userId,
          name: req.user.name,
          email: req.user.email
        },
        details: {
          reason: 'Share link generated',
          changes: [`Expires: ${expiresAt}`, `Max uses: ${maxUses || 'unlimited'}`]
        }
      });

      const shareUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/share/${token}`;

      res.status(200).json({
        success: true,
        message: 'Share link generated',
        data: {
          shareUrl,
          token,
          expiresAt,
          maxUses,
          sharedPassId: sharedPass._id
        }
      });

    } catch (error) {
      console.error('Generate link error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate link',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/sharing/my-shares
 * @desc    Get all passes shared by user
 * @access  Private
 */
router.get('/my-shares',
  auth,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['pending', 'active', 'revoked', 'expired']),
    query('search').optional().trim()
  ],
  validate,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      const { status, search } = req.query;

      // Build query
      const query = { owner: req.user.userId };
      if (status) query.status = status;
      if (search) {
        query['recipient.email'] = { $regex: search, $options: 'i' };
      }

      // Get shares
      const shares = await SharedPass.find(query)
        .populate('pass', 'title type cardNumber holderName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await SharedPass.countDocuments(query);

      res.json({
        success: true,
        data: {
          shares,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total
          }
        }
      });

    } catch (error) {
      console.error('Get shares error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get shares',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/sharing/shared-with-me
 * @desc    Get passes shared with current user
 * @access  Private
 */
router.get('/shared-with-me',
  auth,
  async (req, res) => {
    try {
      const shares = await SharedPass.find({
        'recipient.email': req.user.email,
        status: { $in: ['pending', 'active'] }
      })
        .populate('pass')
        .populate('owner', 'name email')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: { shares }
      });

    } catch (error) {
      console.error('Get shared with me error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get shared passes',
        error: error.message
      });
    }
  }
);

/**
 * @route   PUT /api/sharing/:id
 * @desc    Update share settings
 * @access  Private
 */
router.put('/:id',
  auth,
  [
    param('id').isMongoId(),
    body('accessLevel').optional().isIn(['read', 'edit']),
    body('restrictions').optional().isArray(),
    body('expiryDays').optional().isInt({ min: 1, max: 365 })
  ],
  validate,
  async (req, res) => {
    try {
      const share = await SharedPass.findOne({
        _id: req.params.id,
        owner: req.user.userId
      });

      if (!share) {
        return res.status(404).json({
          success: false,
          message: 'Share not found'
        });
      }

      const previousState = {
        accessLevel: share.accessLevel,
        restrictions: share.restrictions,
        expiresAt: share.expiresAt
      };

      // Update fields
      if (req.body.accessLevel) share.accessLevel = req.body.accessLevel;
      if (req.body.restrictions) share.restrictions = req.body.restrictions;
      if (req.body.expiryDays) {
        const newExpiry = new Date();
        newExpiry.setDate(newExpiry.getDate() + req.body.expiryDays);
        share.expiresAt = newExpiry;
      }

      await share.save();

      // Log changes
      await ShareLog.createLog({
        sharedPass: share._id,
        owner: req.user.userId,
        action: 'modified',
        recipient: share.recipient,
        performedBy: {
          userId: req.user.userId,
          name: req.user.name,
          email: req.user.email
        },
        details: {
          previousValue: previousState,
          newValue: {
            accessLevel: share.accessLevel,
            restrictions: share.restrictions,
            expiresAt: share.expiresAt
          },
          reason: 'Settings updated'
        }
      });

      res.json({
        success: true,
        message: 'Share updated successfully',
        data: { share }
      });

    } catch (error) {
      console.error('Update share error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update share',
        error: error.message
      });
    }
  }
);

/**
 * @route   DELETE /api/sharing/:id/revoke
 * @desc    Revoke share access
 * @access  Private
 */
router.delete('/:id/revoke',
  auth,
  [param('id').isMongoId()],
  validate,
  async (req, res) => {
    try {
      const share = await SharedPass.findOne({
        _id: req.params.id,
        owner: req.user.userId
      });

      if (!share) {
        return res.status(404).json({
          success: false,
          message: 'Share not found'
        });
      }

      share.status = 'revoked';
      await share.save();

      // Log revocation
      await ShareLog.createLog({
        sharedPass: share._id,
        owner: req.user.userId,
        action: 'revoked',
        recipient: share.recipient,
        performedBy: {
          userId: req.user.userId,
          name: req.user.name,
          email: req.user.email
        },
        details: {
          reason: req.body.reason || 'Access revoked by owner'
        }
      });

      res.json({
        success: true,
        message: 'Access revoked successfully'
      });

    } catch (error) {
      console.error('Revoke share error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to revoke access',
        error: error.message
      });
    }
  }
);

// ============================================
// TEMPLATES ENDPOINTS
// ============================================

/**
 * @route   GET /api/sharing/templates
 * @desc    Get user's share templates
 * @access  Private
 */
router.get('/templates',
  auth,
  async (req, res) => {
    try {
      const templates = await ShareTemplate.find({ owner: req.user.userId })
        .sort({ isDefault: -1, usageCount: -1, name: 1 });

      res.json({
        success: true,
        data: { templates }
      });

    } catch (error) {
      console.error('Get templates error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get templates',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/sharing/templates
 * @desc    Create share template
 * @access  Private
 */
router.post('/templates',
  auth,
  [
    body('name').trim().isLength({ min: 1, max: 100 }),
    body('accessLevel').isIn(['read', 'edit']),
    body('expiryDays').isInt({ min: 1, max: 365 }),
    body('restrictions').optional().isArray()
  ],
  validate,
  async (req, res) => {
    try {
      const template = new ShareTemplate({
        owner: req.user.userId,
        ...req.body
      });

      await template.save();

      res.status(201).json({
        success: true,
        message: 'Template created successfully',
        data: { template }
      });

    } catch (error) {
      console.error('Create template error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create template',
        error: error.message
      });
    }
  }
);

/**
 * @route   PUT /api/sharing/templates/:id
 * @desc    Update share template
 * @access  Private
 */
router.put('/templates/:id',
  auth,
  [
    param('id').isMongoId(),
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('accessLevel').optional().isIn(['read', 'edit']),
    body('expiryDays').optional().isInt({ min: 1, max: 365 })
  ],
  validate,
  async (req, res) => {
    try {
      const template = await ShareTemplate.findOneAndUpdate(
        { _id: req.params.id, owner: req.user.userId },
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      res.json({
        success: true,
        message: 'Template updated successfully',
        data: { template }
      });

    } catch (error) {
      console.error('Update template error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update template',
        error: error.message
      });
    }
  }
);

/**
 * @route   DELETE /api/sharing/templates/:id
 * @desc    Delete share template
 * @access  Private
 */
router.delete('/templates/:id',
  auth,
  [param('id').isMongoId()],
  validate,
  async (req, res) => {
    try {
      const template = await ShareTemplate.findOneAndDelete({
        _id: req.params.id,
        owner: req.user.userId
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      res.json({
        success: true,
        message: 'Template deleted successfully'
      });

    } catch (error) {
      console.error('Delete template error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete template',
        error: error.message
      });
    }
  }
);

// ============================================
// LOGS ENDPOINTS
// ============================================

/**
 * @route   GET /api/sharing/logs
 * @desc    Get share activity logs
 * @access  Private
 */
router.get('/logs',
  auth,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('action').optional().isIn(['shared', 'revoked', 'modified', 'accessed', 'expired'])
  ],
  validate,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      const query = { owner: req.user.userId };
      if (req.query.action) query.action = req.query.action;

      const logs = await ShareLog.find(query)
        .populate('sharedPass', 'recipient accessLevel status')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);

      const total = await ShareLog.countDocuments(query);

      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total
          }
        }
      });

    } catch (error) {
      console.error('Get logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get logs',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/sharing/stats
 * @desc    Get sharing statistics
 * @access  Private
 */
router.get('/stats',
  auth,
  async (req, res) => {
    try {
      const stats = await Promise.all([
        SharedPass.countDocuments({ owner: req.user.userId, status: 'active' }),
        SharedPass.countDocuments({ owner: req.user.userId, status: 'pending' }),
        SharedPass.countDocuments({ owner: req.user.userId, status: 'revoked' }),
        SharedPass.countDocuments({ owner: req.user.userId, status: 'expired' }),
        ShareLog.getActivitySummary(req.user.userId, 30)
      ]);

      const recentShares = await SharedPass.find({ owner: req.user.userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('pass', 'title type');

      res.json({
        success: true,
        data: {
          totalActive: stats[0],
          totalPending: stats[1],
          totalRevoked: stats[2],
          totalExpired: stats[3],
          activitySummary: stats[4],
          recentShares
        }
      });

    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get statistics',
        error: error.message
      });
    }
  }
);

export default router;
