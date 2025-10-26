import express from 'express';
import Device from '../models/Device.js';
import SyncLog from '../models/SyncLog.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';
import emailService from '../services/emailService.js';

const router = express.Router();

// @route   POST /api/devices/register
// @desc    Register a new device
// @access  Private
router.post('/register', authenticateToken, async (req, res) => {
  try {
    const {
      deviceName,
      deviceType,
      operatingSystem,
      browser,
      location
    } = req.body;

    // Validate required fields
    if (!deviceName || !deviceType) {
      return res.status(400).json({
        success: false,
        message: 'Device name and type are required'
      });
    }

    // Validate device type
    const validTypes = ['laptop', 'mobile', 'tablet', 'desktop', 'other'];
    if (!validTypes.includes(deviceType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid device type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    logger.info(`Attempting to register device for user ${req.user.userId}: ${deviceName} (${deviceType})`);

    // Generate unique device ID with timestamp to ensure uniqueness
    const deviceId = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;

    // Check if device already exists (same name and type for this user)
    const existingDevice = await Device.findOne({
      userId: req.user.userId,
      deviceName,
      deviceType
    });

    if (existingDevice) {
      logger.info(`Device already exists, updating: ${existingDevice._id}`);
      // Update existing device
      existingDevice.lastActiveAt = new Date();
      existingDevice.status = 'online';
      existingDevice.operatingSystem = operatingSystem || existingDevice.operatingSystem;
      existingDevice.browser = browser || existingDevice.browser;
      existingDevice.ipAddress = req.ip;
      if (location) existingDevice.location = location;
      
      await existingDevice.save();

      return res.json({
        success: true,
        message: 'Device updated successfully',
        device: existingDevice.toObject()
      });
    }

    // Check if this is the first device
    const deviceCount = await Device.countDocuments({ userId: req.user.userId });
    const isPrimary = deviceCount === 0;

    logger.info(`Creating new device (isPrimary: ${isPrimary}, deviceCount: ${deviceCount})`);

    // Create new device
    const device = new Device({
      userId: req.user.userId,
      deviceName,
      deviceType,
      deviceId,
      operatingSystem: operatingSystem || 'Unknown',
      browser: browser || 'Unknown',
      ipAddress: req.ip || '0.0.0.0',
      location: location || {},
      status: 'online',
      isPrimary,
      isTrusted: isPrimary,
      isVerified: isPrimary, // Primary device is auto-verified
      verificationMethod: isPrimary ? 'manual' : null
    });

    await device.save();

    logger.info(`Device registered successfully: ${device._id}`);

    // Create notification for device registration
    try {
      const user = await User.findById(req.user.userId);
      if (user) {
        if (!user.profile) user.profile = {};
        if (!user.profile.notifications) user.profile.notifications = [];
        
        user.profile.notifications.push({
          title: 'New Device Registered',
          message: `"${deviceName}" has been added to your account.`,
          type: 'success',
          category: 'security',
          priority: 'medium',
          isRead: false,
          action: {
            type: 'internal',
            label: 'View Devices',
            link: '/features/multi-device'
          },
          metadata: {
            resourceType: 'device',
            resourceId: device._id.toString(),
            deviceName,
            deviceType
          },
          createdAt: new Date()
        });
        
        await user.save();
        logger.info(`Notification created for device registration: ${device._id}`);
      }
    } catch (notifError) {
      logger.error('Failed to create notification:', notifError);
      // Don't fail registration if notification fails
    }

    // For non-primary devices, send verification email automatically
    if (!isPrimary) {
      try {
        const user = await User.findById(req.user.userId);
        if (user) {
          const verificationCode = device.generateVerificationCode();
          await device.save();

          const deviceInfo = {
            deviceType: device.deviceType,
            operatingSystem: device.operatingSystem,
            browser: device.browser
          };

          await emailService.sendVerificationCode(
            user.email,
            user.name,
            device.deviceName,
            verificationCode,
            deviceInfo
          );

          logger.info(`Verification email sent automatically for device ${device._id}`);
        }
      } catch (emailError) {
        logger.error('Failed to send verification email:', emailError);
        // Don't fail registration if email fails
      }
    }

    res.status(201).json({
      success: true,
      message: isPrimary 
        ? 'Device registered successfully' 
        : 'Device registered. Please check your email for verification code.',
      device: device.toObject(),
      requiresVerification: !isPrimary
    });

  } catch (error) {
    logger.error('Device registration error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
        error: error.message
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A device with this ID already exists',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error registering device',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @route   GET /api/devices
// @desc    Get all user devices
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, sortBy = '-lastActiveAt' } = req.query;

    logger.info(`Fetching devices for user ${req.user.userId}`);

    const query = { userId: req.user.userId };
    if (status) query.status = status;

    const devices = await Device.find(query)
      .sort(sortBy)
      .select('-deviceFingerprint -notificationToken -verificationCode -verificationCodeExpiry')
      .lean();

    // Ensure backward compatibility - add isVerified field if missing
    const devicesWithDefaults = devices.map(device => ({
      ...device,
      isVerified: device.isVerified !== undefined ? device.isVerified : (device.isTrusted || device.isPrimary),
      verificationMethod: device.verificationMethod || (device.isPrimary ? 'manual' : null)
    }));

    logger.info(`Found ${devices.length} devices for user ${req.user.userId}`);

    // Get online devices count
    const onlineCount = await Device.countDocuments({
      userId: req.user.userId,
      status: 'online'
    });

    res.json({
      success: true,
      devices: devicesWithDefaults,
      stats: {
        total: devices.length,
        online: onlineCount,
        offline: devices.length - onlineCount
      }
    });

  } catch (error) {
    logger.error('Error fetching devices:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching devices',
      error: error.message
    });
  }
});

// @route   GET /api/devices/stats/overview
// @desc    Get device statistics
// @access  Private
// NOTE: This must come BEFORE /:id route to avoid route collision
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    logger.info(`Fetching device stats for user ${req.user.userId}`);
    
    const stats = await Device.aggregate([
      { $match: { userId: req.user.userId } },
      {
        $facet: {
          statusBreakdown: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          typeBreakdown: [
            {
              $group: {
                _id: '$deviceType',
                count: { $sum: 1 }
              }
            }
          ],
          recentActivity: [
            { $sort: { lastActiveAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                deviceName: 1,
                deviceType: 1,
                lastActiveAt: 1,
                status: 1
              }
            }
          ],
          syncStats: [
            {
              $group: {
                _id: null,
                avgSyncEnabled: { $avg: { $cond: ['$syncEnabled', 1, 0] } },
                trustedDevices: { $sum: { $cond: ['$isTrusted', 1, 0] } }
              }
            }
          ]
        }
      }
    ]);

    logger.info(`Stats fetched successfully for user ${req.user.userId}`);

    res.json({
      success: true,
      stats: stats[0]
    });

  } catch (error) {
    logger.error('Error fetching device stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// @route   GET /api/devices/:id
// @desc    Get device details
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const device = await Device.findOne({
      _id: req.params.id,
      userId: req.user.userId
    }).select('-deviceFingerprint -notificationToken');

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Get recent sync history for this device
    const recentSyncs = await SyncLog.find({
      userId: req.user.userId,
      deviceId: device._id
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('syncType syncStatus startedAt completedAt duration totalItems');

    res.json({
      success: true,
      device,
      recentSyncs
    });

  } catch (error) {
    logger.error('Error fetching device details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching device details',
      error: error.message
    });
  }
});

// @route   PUT /api/devices/:id
// @desc    Update device settings
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { deviceName, syncEnabled, autoSyncEnabled, syncSettings, isTrusted } = req.body;

    const device = await Device.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    if (deviceName) device.deviceName = deviceName;
    if (syncEnabled !== undefined) device.syncEnabled = syncEnabled;
    if (autoSyncEnabled !== undefined) device.autoSyncEnabled = autoSyncEnabled;
    if (syncSettings) device.syncSettings = { ...device.syncSettings, ...syncSettings };
    if (isTrusted !== undefined) device.isTrusted = isTrusted;

    await device.save();

    res.json({
      success: true,
      message: 'Device updated successfully',
      device
    });

  } catch (error) {
    logger.error('Error updating device:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating device',
      error: error.message
    });
  }
});

// @route   DELETE /api/devices/:id
// @desc    Remove device
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const device = await Device.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Don't allow deleting primary device if there are other devices
    if (device.isPrimary) {
      const otherDevices = await Device.countDocuments({
        userId: req.user.userId,
        _id: { $ne: device._id }
      });

      if (otherDevices > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot remove primary device. Please set another device as primary first.'
        });
      }
    }

    const deviceName = device.deviceName;
    const deviceId = device._id.toString();
    
    await device.deleteOne();

    logger.info(`Device removed: ${deviceName} (${deviceId})`);

    // Create notification for device removal
    try {
      const user = await User.findById(req.user.userId);
      if (user) {
        if (!user.profile) user.profile = {};
        if (!user.profile.notifications) user.profile.notifications = [];
        
        user.profile.notifications.push({
          title: 'Device Removed',
          message: `"${deviceName}" has been removed from your account.`,
          type: 'alert',
          category: 'security',
          priority: 'high',
          isRead: false,
          action: {
            type: 'internal',
            label: 'View Devices',
            link: '/features/multi-device'
          },
          metadata: {
            resourceType: 'device',
            resourceId: deviceId,
            deviceName
          },
          createdAt: new Date()
        });
        
        await user.save();
        logger.info(`Notification created for device removal: ${deviceId}`);
      }
    } catch (notifError) {
      logger.error('Failed to create removal notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Device removed successfully'
    });

  } catch (error) {
    logger.error('Error removing device:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing device',
      error: error.message
    });
  }
});

// @route   POST /api/devices/:id/sync
// @desc    Trigger manual sync
// @access  Private
router.post('/:id/sync', authenticateToken, async (req, res) => {
  try {
    const device = await Device.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Create sync log
    const syncLog = new SyncLog({
      userId: req.user.userId,
      deviceId: device._id,
      syncType: 'manual',
      syncStatus: 'initiated',
      dataTypes: Object.keys(device.syncSettings).filter(key => device.syncSettings[key])
    });

    await syncLog.save();

    // Update device status
    device.status = 'syncing';
    await device.save();

    // In a real implementation, this would trigger actual sync process
    // For now, we'll simulate it
    setTimeout(async () => {
      await syncLog.complete({
        passwords: 10,
        documents: 5,
        settings: 1,
        notes: 0,
        qrcodes: 3
      }, 1024 * 150); // 150KB

      device.status = 'online';
      device.lastSyncedAt = new Date();
      await device.save();
    }, 2000);

    res.json({
      success: true,
      message: 'Sync initiated successfully',
      syncLog: {
        id: syncLog._id,
        status: syncLog.syncStatus,
        startedAt: syncLog.startedAt
      }
    });

  } catch (error) {
    logger.error('Error initiating sync:', error);
    res.status(500).json({
      success: false,
      message: 'Error initiating sync',
      error: error.message
    });
  }
});

// @route   PUT /api/devices/:id/status
// @desc    Update device status
// @access  Private
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['online', 'offline', 'syncing'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const device = await Device.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    await device.updateSyncStatus(status);
    await device.updateLastActive();

    res.json({
      success: true,
      message: 'Device status updated',
      device
    });

  } catch (error) {
    logger.error('Error updating device status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating device status',
      error: error.message
    });
  }
});

// @route   POST /api/devices/:id/send-verification
// @desc    Send verification code to user's email
// @access  Private
router.post('/:id/send-verification', authenticateToken, async (req, res) => {
  try {
    const deviceId = req.params.id;

    // Find device
    const device = await Device.findOne({
      _id: deviceId,
      userId: req.user.userId
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Check if already verified
    if (device.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Device is already verified'
      });
    }

    // Get user details for email
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate verification code
    const verificationCode = device.generateVerificationCode();
    await device.save();

    // Send verification email
    const deviceInfo = {
      deviceType: device.deviceType,
      operatingSystem: device.operatingSystem,
      browser: device.browser
    };

    await emailService.sendVerificationCode(
      user.email,
      user.name,
      device.deviceName,
      verificationCode,
      deviceInfo
    );

    logger.info(`Verification code sent for device ${deviceId} to ${user.email}`);

    res.json({
      success: true,
      message: 'Verification code sent to your email',
      expiresIn: '10 minutes'
    });

  } catch (error) {
    logger.error('Error sending verification code:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending verification code',
      error: error.message
    });
  }
});

// @route   POST /api/devices/:id/verify
// @desc    Verify device with code
// @access  Private
router.post('/:id/verify', authenticateToken, async (req, res) => {
  try {
    const deviceId = req.params.id;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Verification code is required'
      });
    }

    // Find device
    const device = await Device.findOne({
      _id: deviceId,
      userId: req.user.userId
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Check if already verified
    if (device.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Device is already verified'
      });
    }

    // Verify code
    const result = device.verifyCode(code);
    await device.save();

    if (result.success) {
      // Get user details
      const user = await User.findById(req.user.userId);
      
      // Send success notification
      if (user) {
        await emailService.sendDeviceVerifiedNotification(
          user.email,
          user.name,
          device.deviceName
        );
        
        // Create notification for device verification
        try {
          if (!user.profile) user.profile = {};
          if (!user.profile.notifications) user.profile.notifications = [];
          
          user.profile.notifications.push({
            title: 'Device Verified',
            message: `"${device.deviceName}" has been successfully verified and is now trusted.`,
            type: 'success',
            category: 'security',
            priority: 'medium',
            isRead: false,
            action: {
              type: 'internal',
              label: 'View Devices',
              link: '/features/multi-device'
            },
            metadata: {
              resourceType: 'device',
              resourceId: device._id.toString(),
              deviceName: device.deviceName
            },
            createdAt: new Date()
          });
          
          await user.save();
          logger.info(`Notification created for device verification: ${deviceId}`);
        } catch (notifError) {
          logger.error('Failed to create verification notification:', notifError);
        }
      }

      logger.info(`Device ${deviceId} verified successfully`);

      res.json({
        success: true,
        message: result.message,
        device: {
          _id: device._id,
          deviceName: device.deviceName,
          isVerified: device.isVerified,
          verifiedAt: device.verifiedAt,
          isTrusted: device.isTrusted
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        attemptsRemaining: 5 - device.verificationAttempts
      });
    }

  } catch (error) {
    logger.error('Error verifying device:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying device',
      error: error.message
    });
  }
});

// @route   POST /api/devices/:id/resend-verification
// @desc    Resend verification code
// @access  Private
router.post('/:id/resend-verification', authenticateToken, async (req, res) => {
  try {
    const deviceId = req.params.id;

    // Find device
    const device = await Device.findOne({
      _id: deviceId,
      userId: req.user.userId
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Check if already verified
    if (device.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Device is already verified'
      });
    }

    // Get user details
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new verification code
    const verificationCode = device.generateVerificationCode();
    await device.save();

    // Send verification email
    const deviceInfo = {
      deviceType: device.deviceType,
      operatingSystem: device.operatingSystem,
      browser: device.browser
    };

    await emailService.sendVerificationCode(
      user.email,
      user.name,
      device.deviceName,
      verificationCode,
      deviceInfo
    );

    logger.info(`Verification code resent for device ${deviceId}`);

    res.json({
      success: true,
      message: 'Verification code resent to your email',
      expiresIn: '10 minutes'
    });

  } catch (error) {
    logger.error('Error resending verification code:', error);
    res.status(500).json({
      success: false,
      message: 'Error resending verification code',
      error: error.message
    });
  }
});

export default router;
