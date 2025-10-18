import express from 'express';
import Device from '../models/Device.js';
import SyncLog from '../models/SyncLog.js';
import { authenticateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';

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

    // Generate unique device ID
    const deviceId = crypto.randomBytes(16).toString('hex');

    // Check if device already exists
    const existingDevice = await Device.findOne({
      userId: req.user.id,
      deviceName,
      deviceType
    });

    if (existingDevice) {
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
        device: existingDevice
      });
    }

    // Check if this is the first device
    const deviceCount = await Device.countDocuments({ userId: req.user.id });
    const isPrimary = deviceCount === 0;

    // Create new device
    const device = new Device({
      userId: req.user.id,
      deviceName,
      deviceType,
      deviceId,
      operatingSystem,
      browser,
      ipAddress: req.ip,
      location,
      status: 'online',
      isPrimary,
      isTrusted: isPrimary
    });

    await device.save();

    // Create notification for new device
    logger.info(`New device registered for user ${req.user.id}: ${deviceName}`);

    res.status(201).json({
      success: true,
      message: 'Device registered successfully',
      device: {
        id: device._id,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        status: device.status,
        isPrimary: device.isPrimary,
        createdAt: device.createdAt
      }
    });

  } catch (error) {
    logger.error('Device registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering device',
      error: error.message
    });
  }
});

// @route   GET /api/devices
// @desc    Get all user devices
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, sortBy = '-lastActiveAt' } = req.query;

    const query = { userId: req.user.id };
    if (status) query.status = status;

    const devices = await Device.find(query)
      .sort(sortBy)
      .select('-deviceFingerprint -notificationToken')
      .lean();

    // Get online devices count
    const onlineCount = await Device.countDocuments({
      userId: req.user.id,
      status: 'online'
    });

    res.json({
      success: true,
      devices,
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

// @route   GET /api/devices/:id
// @desc    Get device details
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const device = await Device.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).select('-deviceFingerprint -notificationToken');

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Get recent sync history for this device
    const recentSyncs = await SyncLog.find({
      userId: req.user.id,
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
      userId: req.user.id
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
      userId: req.user.id
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
        userId: req.user.id,
        _id: { $ne: device._id }
      });

      if (otherDevices > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot remove primary device. Please set another device as primary first.'
        });
      }
    }

    await device.deleteOne();

    logger.info(`Device removed: ${device.deviceName} (${device._id})`);

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
      userId: req.user.id
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Create sync log
    const syncLog = new SyncLog({
      userId: req.user.id,
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
      userId: req.user.id
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

// @route   GET /api/devices/stats/overview
// @desc    Get device statistics
// @access  Private
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const stats = await Device.aggregate([
      { $match: { userId: req.user.id } },
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

export default router;
