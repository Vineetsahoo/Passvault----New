import express from 'express';
import QRCode from '../models/QRCode.js';
import { authenticateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';
import qrcode from 'qrcode';
import crypto from 'crypto';

const router = express.Router();

// Encryption helpers for QR data
const algorithm = 'aes-256-cbc';

function encryptData(text, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted
  };
}

function decryptData(encryptedData, key, iv) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(key, 'hex'),
    Buffer.from(iv, 'hex')
  );
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// @route   POST /api/qrcodes
// @desc    Create a new QR code
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      qrType,
      title,
      data,
      isEncrypted,
      category,
      tags,
      description,
      expiresIn,
      maxScans,
      color,
      backgroundColor,
      size
    } = req.body;

    if (!qrType || !title || !data) {
      return res.status(400).json({
        success: false,
        message: 'QR type, title, and data are required'
      });
    }

    let encryptedData = null;
    let encryptionKey = null;
    let iv = null;

    // Encrypt data if requested
    if (isEncrypted) {
      encryptionKey = crypto.randomBytes(32).toString('hex');
      const encrypted = encryptData(JSON.stringify(data), encryptionKey);
      encryptedData = encrypted.encryptedData;
      iv = encrypted.iv;
    }

    // Calculate expiry date
    let expiresAt = null;
    if (expiresIn) {
      const days = parseInt(expiresIn);
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);
    }

    // Extract expiry date from card data if it exists (for credit/debit cards)
    if (!expiresAt && data && typeof data === 'object') {
      if (data.expiry || data.expiryDate) {
        const expiryStr = data.expiry || data.expiryDate;
        // Parse MM/YY format
        const expiryParts = expiryStr.split('/');
        if (expiryParts.length === 2) {
          const month = parseInt(expiryParts[0], 10);
          const year = parseInt('20' + expiryParts[1], 10);
          // Set to last day of expiry month
          expiresAt = new Date(year, month, 0);
          console.log(`📅 [QR Create] Extracted expiry date from card data: ${expiryStr} → ${expiresAt.toLocaleDateString()}`);
        }
      }
    }

    // Generate QR code image based on type and data
    let qrDataString = '';
    switch (qrType) {
      case 'wifi':
        qrDataString = `WIFI:T:${data.encryption};S:${data.ssid};P:${data.password};;`;
        break;
      case 'url':
        qrDataString = data.url;
        break;
      case 'email':
        qrDataString = `mailto:${data.email}?subject=${data.subject || ''}&body=${data.body || ''}`;
        break;
      case 'phone':
        qrDataString = `tel:${data.phone}`;
        break;
      case 'text':
        qrDataString = data.text;
        break;
      case 'contact':
        qrDataString = `BEGIN:VCARD\nVERSION:3.0\nFN:${data.name}\nTEL:${data.phone}\nEMAIL:${data.email}\nEND:VCARD`;
        break;
      case 'password':
        qrDataString = isEncrypted ? encryptedData : JSON.stringify(data);
        break;
      default:
        qrDataString = JSON.stringify(data);
    }

    // Generate QR code image
    const qrCodeImage = await qrcode.toDataURL(qrDataString, {
      color: {
        dark: color || '#000000',
        light: backgroundColor || '#FFFFFF'
      },
      width: size || 256,
      errorCorrectionLevel: 'H'
    });

    // Create QR code record
    const qrCode = new QRCode({
      userId: req.user.userId,
      qrType,
      title,
      data: isEncrypted ? {} : data,
      encryptedData: isEncrypted ? encryptedData : null,
      qrCodeImage,
      isEncrypted,
      category: category || 'general',
      tags: tags || [],
      description: description || '',
      expiresAt,
      maxScans: maxScans || null,
      color: color || '#000000',
      backgroundColor: backgroundColor || '#FFFFFF',
      size: size || 256
    });

    // Store encryption metadata separately if encrypted
    if (isEncrypted && encryptionKey) {
      qrCode.data = { encryptionKey, iv };
    }

    await qrCode.save();

    // Create notification for card/pass creation
    try {
      const User = (await import('../models/User.js')).default;
      const user = await User.findById(req.user.userId);
      
      if (user) {
        // Ensure profile and notifications array exist
        if (!user.profile) {
          user.profile = {};
        }
        if (!user.profile.notifications) {
          user.profile.notifications = [];
        }

        // Determine card/pass type for notification
        const cardType = qrType === 'password' ? 'Card' : 'Pass';
        const notificationType = qrType === 'password' ? 'security' : 'success';
        const icon = qrType === 'password' ? '💳' : '🎫';

        user.profile.notifications.push({
          title: `${icon} New ${cardType} Created`,
          message: `Your "${title}" has been successfully created and secured with a QR code.`,
          type: notificationType,
          category: 'document',
          priority: 'medium',
          isRead: false,
          action: {
            type: 'internal',
            label: 'View Card',
            link: '/features/qr-scan'
          },
          metadata: {
            resourceType: 'qrcode',
            resourceId: qrCode._id.toString(),
            newValue: `${qrType}:${title}`
          },
          createdAt: new Date()
        });

        await user.save();
        logger.info(`Notification created for QR code: ${qrCode._id}`);
      }
    } catch (notifError) {
      logger.error('Error creating notification:', notifError);
      // Don't fail the request if notification creation fails
    }

    logger.info(`QR code created: ${qrCode._id} by user ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'QR code created successfully',
      qrCode: {
        id: qrCode._id,
        title: qrCode.title,
        qrType: qrCode.qrType,
        qrCodeImage: qrCode.qrCodeImage,
        isEncrypted: qrCode.isEncrypted,
        createdAt: qrCode.createdAt
      }
    });

  } catch (error) {
    logger.error('QR code creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating QR code',
      error: error.message
    });
  }
});

// @route   GET /api/qrcodes
// @desc    Get all QR codes for user
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { qrType, category, search, sortBy = '-createdAt', page = 1, limit = 20 } = req.query;

    const query = {
      userId: req.user.userId,
      isActive: true
    };

    if (qrType && qrType !== 'all') {
      query.qrType = qrType;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    const qrCodes = await QRCode.find(query)
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-encryptedData -data.encryptionKey -data.iv')
      .lean();

    const count = await QRCode.countDocuments(query);

    res.json({
      success: true,
      qrCodes,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(count / limit),
        total: count
      }
    });

  } catch (error) {
    logger.error('Error fetching QR codes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching QR codes',
      error: error.message
    });
  }
});

// @route   GET /api/qrcodes/:id
// @desc    Get QR code details
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const qrCode = await QRCode.findOne({
      _id: req.params.id,
      userId: req.user.userId
    }).select('-encryptedData -data.encryptionKey -data.iv');

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found'
      });
    }

    res.json({
      success: true,
      qrCode
    });

  } catch (error) {
    logger.error('Error fetching QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching QR code',
      error: error.message
    });
  }
});

// @route   PUT /api/qrcodes/:id
// @desc    Update QR code
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, category, tags, description, isActive } = req.body;

    const qrCode = await QRCode.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found'
      });
    }

    if (title) qrCode.title = title;
    if (category) qrCode.category = category;
    if (tags) qrCode.tags = tags;
    if (description !== undefined) qrCode.description = description;
    if (isActive !== undefined) qrCode.isActive = isActive;

    await qrCode.save();

    res.json({
      success: true,
      message: 'QR code updated successfully',
      qrCode
    });

  } catch (error) {
    logger.error('Error updating QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating QR code',
      error: error.message
    });
  }
});

// @route   DELETE /api/qrcodes/:id
// @desc    Delete QR code
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const qrCode = await QRCode.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found'
      });
    }

    await qrCode.deleteOne();

    logger.info(`QR code deleted: ${qrCode._id}`);

    res.json({
      success: true,
      message: 'QR code deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting QR code',
      error: error.message
    });
  }
});

// @route   POST /api/qrcodes/:id/scan
// @desc    Record QR code scan
// @access  Public (with optional authentication)
router.post('/:id/scan', async (req, res) => {
  try {
    const { deviceInfo, location } = req.body;

    const qrCode = await QRCode.findById(req.params.id);

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found'
      });
    }

    // Check if expired
    if (qrCode.isExpired()) {
      return res.status(403).json({
        success: false,
        message: 'QR code has expired'
      });
    }

    // Check if max scans reached
    if (qrCode.hasReachedMaxScans()) {
      return res.status(403).json({
        success: false,
        message: 'QR code has reached maximum scans'
      });
    }

    // Check if active
    if (!qrCode.isActive) {
      return res.status(403).json({
        success: false,
        message: 'QR code is not active'
      });
    }

    // Record scan
    await qrCode.recordScan(deviceInfo, req.ip, location);

    // Return decrypted data if encrypted
    let responseData = qrCode.data;
    if (qrCode.isEncrypted && qrCode.encryptedData) {
      const { encryptionKey, iv } = qrCode.data;
      if (encryptionKey && iv) {
        const decrypted = decryptData(qrCode.encryptedData, encryptionKey, iv);
        responseData = JSON.parse(decrypted);
      }
    }

    res.json({
      success: true,
      message: 'QR code scanned successfully',
      data: {
        type: qrCode.qrType,
        title: qrCode.title,
        content: responseData,
        scanCount: qrCode.scanCount
      }
    });

  } catch (error) {
    logger.error('Error recording QR scan:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording scan',
      error: error.message
    });
  }
});

// @route   GET /api/qrcodes/:id/image
// @desc    Get QR code image
// @access  Public
router.get('/:id/image', async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id).select('qrCodeImage isActive');

    if (!qrCode || !qrCode.isActive) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found'
      });
    }

    // Return base64 image
    res.json({
      success: true,
      image: qrCode.qrCodeImage
    });

  } catch (error) {
    logger.error('Error fetching QR image:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching QR image',
      error: error.message
    });
  }
});

// @route   POST /api/qrcodes/scan/decode
// @desc    Decode scanned QR code
// @access  Private
router.post('/scan/decode', authenticateToken, async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR data is required'
      });
    }

    // Parse QR data based on format
    let parsedData = {};
    let type = 'text';

    if (qrData.startsWith('WIFI:')) {
      type = 'wifi';
      const parts = qrData.match(/T:([^;]+);S:([^;]+);P:([^;]+)/);
      if (parts) {
        parsedData = {
          encryption: parts[1],
          ssid: parts[2],
          password: parts[3]
        };
      }
    } else if (qrData.startsWith('http://') || qrData.startsWith('https://')) {
      type = 'url';
      parsedData = { url: qrData };
    } else if (qrData.startsWith('mailto:')) {
      type = 'email';
      const emailMatch = qrData.match(/mailto:([^?]+)/);
      parsedData = { email: emailMatch ? emailMatch[1] : '' };
    } else if (qrData.startsWith('tel:')) {
      type = 'phone';
      parsedData = { phone: qrData.replace('tel:', '') };
    } else if (qrData.startsWith('BEGIN:VCARD')) {
      type = 'contact';
      // Parse vCard
      parsedData = { vcard: qrData };
    } else {
      parsedData = { text: qrData };
    }

    res.json({
      success: true,
      type,
      data: parsedData
    });

  } catch (error) {
    logger.error('Error decoding QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Error decoding QR code',
      error: error.message
    });
  }
});

// @route   GET /api/qrcodes/stats/overview
// @desc    Get QR code statistics
// @access  Private
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const stats = await QRCode.aggregate([
      { $match: { userId: req.user.userId } },
      {
        $facet: {
          totalStats: [
            {
              $group: {
                _id: null,
                totalQRCodes: { $sum: 1 },
                totalScans: { $sum: '$scanCount' },
                activeQRCodes: {
                  $sum: { $cond: ['$isActive', 1, 0] }
                }
              }
            }
          ],
          typeBreakdown: [
            {
              $group: {
                _id: '$qrType',
                count: { $sum: 1 },
                scans: { $sum: '$scanCount' }
              }
            }
          ],
          recentScans: [
            { $match: { lastScannedAt: { $ne: null } } },
            { $sort: { lastScannedAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                title: 1,
                qrType: 1,
                lastScannedAt: 1,
                scanCount: 1
              }
            }
          ],
          popularQRCodes: [
            { $sort: { scanCount: -1 } },
            { $limit: 5 },
            {
              $project: {
                title: 1,
                qrType: 1,
                scanCount: 1
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
    logger.error('Error fetching QR stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

export default router;
