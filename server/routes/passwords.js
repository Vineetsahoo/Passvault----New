import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Password from '../models/Password.js';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Apply authentication middleware to all password routes
router.use(authenticateToken);

// Validation middleware
const validatePassword = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required'),
  
  body('website')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Website URL cannot exceed 200 characters'),
  
  body('username')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Username cannot exceed 100 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  
  body('category')
    .optional()
    .isIn(['social', 'email', 'finance', 'work', 'personal', 'shopping', 'entertainment', 'other'])
    .withMessage('Invalid category'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters')
];

// @route   GET /api/passwords
// @desc    Get all passwords for user
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isIn(['social', 'email', 'finance', 'work', 'personal', 'shopping', 'entertainment', 'other']),
  query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search term must be between 1 and 100 characters'),
  query('sortBy').optional().isIn(['title', 'createdAt', 'lastUsed', 'website']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 20,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      favorites = false
    } = req.query;

    // Build query
    let query = { userId: req.user.userId };

    if (category) {
      query.category = category;
    }

    if (favorites === 'true') {
      query.isFavorite = true;
    }

    // Handle search
    let passwords;
    if (search) {
      passwords = await Password.searchPasswords(req.user.userId, search);
    } else {
      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      passwords = await Password.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-encryptedPassword -attachments');
    }

    // Get total count for pagination
    const total = await Password.countDocuments(query);

    res.json({
      success: true,
      message: 'Passwords retrieved successfully',
      data: {
        passwords,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    logger.error('Get passwords error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve passwords'
    });
  }
});

// @route   GET /api/passwords/:id
// @desc    Get single password (with decrypted password)
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const password = await Password.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!password) {
      return res.status(404).json({
        success: false,
        message: 'Password not found'
      });
    }

    // Decrypt password for display
    const decryptedPassword = password.decryptPassword();

    // Update last used
    await password.updateLastUsed();

    res.json({
      success: true,
      message: 'Password retrieved successfully',
      data: {
        password: {
          ...password.toJSON(),
          password: decryptedPassword
        }
      }
    });

  } catch (error) {
    logger.error('Get password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve password'
    });
  }
});

// @route   POST /api/passwords
// @desc    Create new password
// @access  Private
router.post('/', validatePassword, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      password,
      website,
      username,
      email,
      category = 'other',
      notes = '',
      tags = [],
      isFavorite = false,
      expiresAt
    } = req.body;

    // Create new password
    const newPassword = new Password({
      userId: req.user.userId,
      title: title.trim(),
      website: website?.trim(),
      username: username?.trim(),
      email: email?.toLowerCase().trim(),
      notes: notes.trim(),
      category,
      tags: tags.map(tag => tag.trim()).filter(tag => tag.length > 0),
      isFavorite,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      metadata: {
        createdFrom: 'web'
      }
    });

    // Encrypt and calculate strength
    newPassword.encryptPassword(password);
    newPassword.calculatePasswordStrength(password);

    await newPassword.save();

    logger.info(`New password created for user: ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Password created successfully',
      data: {
        password: newPassword.toJSON()
      }
    });

  } catch (error) {
    logger.error('Create password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create password'
    });
  }
});

// @route   PUT /api/passwords/:id
// @desc    Update password
// @access  Private
router.put('/:id', validatePassword, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const password = await Password.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!password) {
      return res.status(404).json({
        success: false,
        message: 'Password not found'
      });
    }

    const {
      title,
      password: newPassword,
      website,
      username,
      email,
      category,
      notes,
      tags,
      isFavorite,
      expiresAt
    } = req.body;

    // Update fields
    password.title = title.trim();
    password.website = website?.trim();
    password.username = username?.trim();
    password.email = email?.toLowerCase().trim();
    password.notes = notes?.trim() || '';
    password.category = category;
    password.tags = tags ? tags.map(tag => tag.trim()).filter(tag => tag.length > 0) : password.tags;
    password.isFavorite = isFavorite !== undefined ? isFavorite : password.isFavorite;
    password.expiresAt = expiresAt ? new Date(expiresAt) : null;

    // Update password if provided
    if (newPassword) {
      password.encryptPassword(newPassword);
      password.calculatePasswordStrength(newPassword);
    }

    password.metadata.lastModifiedFrom = 'web';
    password.metadata.version += 1;

    await password.save();

    logger.info(`Password updated for user: ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Password updated successfully',
      data: {
        password: password.toJSON()
      }
    });

  } catch (error) {
    logger.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password'
    });
  }
});

// @route   DELETE /api/passwords/:id
// @desc    Delete password
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const password = await Password.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!password) {
      return res.status(404).json({
        success: false,
        message: 'Password not found'
      });
    }

    logger.info(`Password deleted for user: ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Password deleted successfully'
    });

  } catch (error) {
    logger.error('Delete password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete password'
    });
  }
});

// @route   GET /api/passwords/categories/stats
// @desc    Get password statistics by category
// @access  Private
router.get('/categories/stats', async (req, res) => {
  try {
    const stats = await Password.aggregate([
      { $match: { userId: req.user.userId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          weakCount: {
            $sum: {
              $cond: [{ $eq: ['$strength', 'weak'] }, 1, 0]
            }
          },
          compromisedCount: {
            $sum: {
              $cond: ['$isCompromised', 1, 0]
            }
          }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          weakCount: 1,
          compromisedCount: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get overall stats
    const overall = await Password.aggregate([
      { $match: { userId: req.user.userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          favorites: {
            $sum: {
              $cond: ['$isFavorite', 1, 0]
            }
          },
          weak: {
            $sum: {
              $cond: [{ $eq: ['$strength', 'weak'] }, 1, 0]
            }
          },
          medium: {
            $sum: {
              $cond: [{ $eq: ['$strength', 'medium'] }, 1, 0]
            }
          },
          strong: {
            $sum: {
              $cond: [{ $eq: ['$strength', 'strong'] }, 1, 0]
            }
          },
          veryStrong: {
            $sum: {
              $cond: [{ $eq: ['$strength', 'very-strong'] }, 1, 0]
            }
          },
          compromised: {
            $sum: {
              $cond: ['$isCompromised', 1, 0]
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      message: 'Password statistics retrieved successfully',
      data: {
        byCategory: stats,
        overall: overall[0] || {
          total: 0,
          favorites: 0,
          weak: 0,
          medium: 0,
          strong: 0,
          veryStrong: 0,
          compromised: 0
        }
      }
    });

  } catch (error) {
    logger.error('Get password stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve password statistics'
    });
  }
});

// @route   GET /api/passwords/expiring
// @desc    Get passwords expiring soon
// @access  Private
router.get('/expiring/soon', [
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const days = parseInt(req.query.days) || 30;
    const passwords = await Password.findExpiring(req.user.userId, days);

    res.json({
      success: true,
      message: 'Expiring passwords retrieved successfully',
      data: {
        passwords,
        expiringIn: days
      }
    });

  } catch (error) {
    logger.error('Get expiring passwords error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve expiring passwords'
    });
  }
});

// @route   POST /api/passwords/:id/favorite
// @desc    Toggle password favorite status
// @access  Private
router.post('/:id/favorite', async (req, res) => {
  try {
    const password = await Password.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!password) {
      return res.status(404).json({
        success: false,
        message: 'Password not found'
      });
    }

    password.isFavorite = !password.isFavorite;
    await password.save();

    res.json({
      success: true,
      message: `Password ${password.isFavorite ? 'added to' : 'removed from'} favorites`,
      data: {
        isFavorite: password.isFavorite
      }
    });

  } catch (error) {
    logger.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle favorite status'
    });
  }
});

// @route   POST /api/passwords/:id/compromised
// @desc    Mark password as compromised
// @access  Private
router.post('/:id/compromised', async (req, res) => {
  try {
    const password = await Password.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!password) {
      return res.status(404).json({
        success: false,
        message: 'Password not found'
      });
    }

    await password.markAsCompromised();

    res.json({
      success: true,
      message: 'Password marked as compromised',
      data: {
        isCompromised: password.isCompromised,
        compromisedAt: password.compromisedAt
      }
    });

  } catch (error) {
    logger.error('Mark compromised error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark password as compromised'
    });
  }
});

export default router;