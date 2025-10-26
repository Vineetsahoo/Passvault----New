import express from 'express';
import SyncLog from '../models/SyncLog.js';
import Device from '../models/Device.js';
import { authenticateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// @route   POST /api/sync/initiate
// @desc    Initiate sync for a device
// @access  Private
router.post('/initiate', authenticateToken, async (req, res) => {
  try {
    const {
      deviceId,
      syncType = 'manual',
      dataTypes = ['passwords', 'documents', 'settings', 'notes', 'qrcodes'],
      metadata = {}
    } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID is required'
      });
    }

    // Verify device belongs to user
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

    if (!device.syncEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Sync is disabled for this device'
      });
    }

    // Check if there's already an active sync for this device
    const activeSyncLog = await SyncLog.findOne({
      userId: req.user.userId,
      deviceId: deviceId,
      syncStatus: { $in: ['initiated', 'in_progress'] }
    });

    if (activeSyncLog) {
      return res.status(409).json({
        success: false,
        message: 'Sync already in progress for this device',
        syncLog: activeSyncLog
      });
    }

    // Create new sync log
    const syncLog = new SyncLog({
      userId: req.user.userId,
      deviceId: deviceId,
      syncType,
      syncStatus: 'initiated',
      dataTypes,
      metadata: {
        ...metadata,
        initiatedBy: 'user',
        clientVersion: req.headers['client-version'] || 'unknown'
      }
    });

    await syncLog.save();

    // Update device status
    await device.updateSyncStatus('syncing');

    logger.info(`Sync initiated: ${syncLog._id} for device ${deviceId}`);

    // Simulate async sync process
    performSync(syncLog._id, deviceId, dataTypes, req.user.userId);

    res.status(201).json({
      success: true,
      message: 'Sync initiated successfully',
      syncLog: {
        id: syncLog._id,
        syncType: syncLog.syncType,
        syncStatus: syncLog.syncStatus,
        dataTypes: syncLog.dataTypes,
        startedAt: syncLog.startedAt
      }
    });

  } catch (error) {
    logger.error('Sync initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error initiating sync',
      error: error.message
    });
  }
});

// @route   GET /api/sync/status/:syncLogId
// @desc    Get sync status
// @access  Private
router.get('/status/:syncLogId', authenticateToken, async (req, res) => {
  try {
    const syncLog = await SyncLog.findOne({
      _id: req.params.syncLogId,
      userId: req.user.userId
    }).populate('deviceId', 'deviceName deviceType');

    if (!syncLog) {
      return res.status(404).json({
        success: false,
        message: 'Sync log not found'
      });
    }

    res.json({
      success: true,
      syncLog
    });

  } catch (error) {
    logger.error('Error fetching sync status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sync status',
      error: error.message
    });
  }
});

// @route   GET /api/sync/history
// @desc    Get sync history
// @access  Private
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const {
      deviceId,
      syncType,
      syncStatus,
      sortBy = '-startedAt',
      page = 1,
      limit = 20
    } = req.query;

    const query = { userId: req.user.userId };

    if (deviceId) query.deviceId = deviceId;
    if (syncType) query.syncType = syncType;
    if (syncStatus) query.syncStatus = syncStatus;

    const syncLogs = await SyncLog.find(query)
      .populate('deviceId', 'deviceName deviceType')
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await SyncLog.countDocuments(query);

    res.json({
      success: true,
      syncLogs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(count / limit),
        total: count
      }
    });

  } catch (error) {
    logger.error('Error fetching sync history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sync history',
      error: error.message
    });
  }
});

// @route   GET /api/sync/recent
// @desc    Get recent sync logs
// @access  Private
router.get('/recent', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const syncLogs = await SyncLog.getRecentSyncs(req.user.userId, parseInt(limit));

    res.json({
      success: true,
      syncLogs
    });

  } catch (error) {
    logger.error('Error fetching recent syncs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent syncs',
      error: error.message
    });
  }
});

// @route   GET /api/sync/conflicts
// @desc    Get unresolved sync conflicts
// @access  Private
router.get('/conflicts', authenticateToken, async (req, res) => {
  try {
    const syncLogs = await SyncLog.find({
      userId: req.user.userId,
      'conflicts.0': { $exists: true },
      'conflicts.resolution': { $exists: false }
    })
      .populate('deviceId', 'deviceName deviceType')
      .sort('-startedAt')
      .lean();

    const conflicts = syncLogs.reduce((acc, log) => {
      const unresolvedConflicts = log.conflicts.filter(c => !c.resolution);
      if (unresolvedConflicts.length > 0) {
        acc.push({
          syncLogId: log._id,
          deviceName: log.deviceId?.deviceName,
          syncedAt: log.startedAt,
          conflicts: unresolvedConflicts
        });
      }
      return acc;
    }, []);

    res.json({
      success: true,
      conflicts,
      totalConflicts: conflicts.reduce((sum, item) => sum + item.conflicts.length, 0)
    });

  } catch (error) {
    logger.error('Error fetching conflicts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conflicts',
      error: error.message
    });
  }
});

// @route   PUT /api/sync/resolve-conflict/:syncLogId
// @desc    Resolve a sync conflict
// @access  Private
router.put('/resolve-conflict/:syncLogId', authenticateToken, async (req, res) => {
  try {
    const { conflictIndex, resolution } = req.body;

    if (conflictIndex === undefined || !resolution) {
      return res.status(400).json({
        success: false,
        message: 'Conflict index and resolution are required'
      });
    }

    const syncLog = await SyncLog.findOne({
      _id: req.params.syncLogId,
      userId: req.user.userId
    });

    if (!syncLog) {
      return res.status(404).json({
        success: false,
        message: 'Sync log not found'
      });
    }

    if (!syncLog.conflicts || !syncLog.conflicts[conflictIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Conflict not found'
      });
    }

    // Update conflict resolution
    syncLog.conflicts[conflictIndex].resolution = resolution;
    syncLog.conflicts[conflictIndex].resolvedAt = new Date();
    syncLog.conflicts[conflictIndex].resolvedBy = 'user';

    await syncLog.save();

    logger.info(`Conflict resolved: ${syncLog._id}[${conflictIndex}]`);

    res.json({
      success: true,
      message: 'Conflict resolved successfully',
      conflict: syncLog.conflicts[conflictIndex]
    });

  } catch (error) {
    logger.error('Error resolving conflict:', error);
    res.status(500).json({
      success: false,
      message: 'Error resolving conflict',
      error: error.message
    });
  }
});

// @route   GET /api/sync/stats/overview
// @desc    Get sync statistics
// @access  Private
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const stats = await SyncLog.aggregate([
      { $match: { userId: req.user.userId } },
      {
        $facet: {
          totalStats: [
            {
              $group: {
                _id: null,
                totalSyncs: { $sum: 1 },
                completedSyncs: {
                  $sum: { $cond: [{ $eq: ['$syncStatus', 'completed'] }, 1, 0] }
                },
                failedSyncs: {
                  $sum: { $cond: [{ $eq: ['$syncStatus', 'failed'] }, 1, 0] }
                },
                totalDataSynced: { $sum: '$dataSynced' },
                totalItemsSynced: { $sum: '$totalItems' },
                avgDuration: { $avg: '$duration' },
                totalConflicts: {
                  $sum: { $size: { $ifNull: ['$conflicts', []] } }
                }
              }
            }
          ],
          statusBreakdown: [
            {
              $group: {
                _id: '$syncStatus',
                count: { $sum: 1 }
              }
            }
          ],
          typeBreakdown: [
            {
              $group: {
                _id: '$syncType',
                count: { $sum: 1 }
              }
            }
          ],
          recentSyncs: [
            { $sort: { startedAt: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: 'devices',
                localField: 'deviceId',
                foreignField: '_id',
                as: 'device'
              }
            },
            { $unwind: '$device' },
            {
              $project: {
                syncType: 1,
                syncStatus: 1,
                totalItems: 1,
                duration: 1,
                startedAt: 1,
                deviceName: '$device.deviceName'
              }
            }
          ],
          dataTypeStats: [
            {
              $group: {
                _id: null,
                totalPasswords: { $sum: '$itemsSynced.passwords' },
                totalDocuments: { $sum: '$itemsSynced.documents' },
                totalSettings: { $sum: '$itemsSynced.settings' },
                totalNotes: { $sum: '$itemsSynced.notes' },
                totalQRCodes: { $sum: '$itemsSynced.qrcodes' }
              }
            }
          ],
          performanceMetrics: [
            {
              $group: {
                _id: null,
                avgSyncSpeed: {
                  $avg: {
                    $cond: [
                      { $gt: ['$duration', 0] },
                      { $divide: ['$dataSynced', { $divide: ['$duration', 1000] }] },
                      0
                    ]
                  }
                },
                maxDuration: { $max: '$duration' },
                minDuration: { $min: '$duration' }
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
    logger.error('Error fetching sync stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// @route   POST /api/sync/cancel/:syncLogId
// @desc    Cancel an ongoing sync
// @access  Private
router.post('/cancel/:syncLogId', authenticateToken, async (req, res) => {
  try {
    const syncLog = await SyncLog.findOne({
      _id: req.params.syncLogId,
      userId: req.user.userId,
      syncStatus: { $in: ['initiated', 'in_progress'] }
    });

    if (!syncLog) {
      return res.status(404).json({
        success: false,
        message: 'Active sync not found'
      });
    }

    await syncLog.fail({
      message: 'Sync cancelled by user',
      code: 'USER_CANCELLED'
    });

    // Update device status
    const device = await Device.findById(syncLog.deviceId);
    if (device) {
      await device.updateSyncStatus('online');
    }

    logger.info(`Sync cancelled: ${syncLog._id}`);

    res.json({
      success: true,
      message: 'Sync cancelled successfully'
    });

  } catch (error) {
    logger.error('Error cancelling sync:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling sync',
      error: error.message
    });
  }
});

// @route   GET /api/sync/settings
// @desc    Get sync settings for all devices
// @access  Private
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const devices = await Device.find({
      userId: req.user.userId
    })
      .select('deviceName deviceType syncEnabled autoSyncEnabled syncSettings')
      .lean();

    res.json({
      success: true,
      devices
    });

  } catch (error) {
    logger.error('Error fetching sync settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sync settings',
      error: error.message
    });
  }
});

// @route   PUT /api/sync/settings/:deviceId
// @desc    Update sync settings for a device
// @access  Private
router.put('/settings/:deviceId', authenticateToken, async (req, res) => {
  try {
    const { syncEnabled, autoSyncEnabled, syncSettings } = req.body;

    const device = await Device.findOne({
      _id: req.params.deviceId,
      userId: req.user.userId
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    if (syncEnabled !== undefined) device.syncEnabled = syncEnabled;
    if (autoSyncEnabled !== undefined) device.autoSyncEnabled = autoSyncEnabled;
    if (syncSettings) {
      device.syncSettings = {
        ...device.syncSettings,
        ...syncSettings
      };
    }

    await device.save();

    logger.info(`Sync settings updated for device: ${device._id}`);

    res.json({
      success: true,
      message: 'Sync settings updated successfully',
      device: {
        id: device._id,
        deviceName: device.deviceName,
        syncEnabled: device.syncEnabled,
        autoSyncEnabled: device.autoSyncEnabled,
        syncSettings: device.syncSettings
      }
    });

  } catch (error) {
    logger.error('Error updating sync settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating sync settings',
      error: error.message
    });
  }
});

// Helper function to perform sync (simulated)
async function performSync(syncLogId, deviceId, dataTypes, userId) {
  try {
    // Simulate async sync process
    await new Promise(resolve => setTimeout(resolve, 3000));

    const syncLog = await SyncLog.findById(syncLogId);
    if (!syncLog) return;

    // Update status to in_progress
    syncLog.syncStatus = 'in_progress';
    await syncLog.save();

    // Simulate syncing different data types
    const itemsSynced = {
      passwords: dataTypes.includes('passwords') ? Math.floor(Math.random() * 20) : 0,
      documents: dataTypes.includes('documents') ? Math.floor(Math.random() * 10) : 0,
      settings: dataTypes.includes('settings') ? (dataTypes.includes('settings') ? 1 : 0) : 0,
      notes: dataTypes.includes('notes') ? Math.floor(Math.random() * 15) : 0,
      qrcodes: dataTypes.includes('qrcodes') ? Math.floor(Math.random() * 8) : 0
    };

    const totalItems = Object.values(itemsSynced).reduce((sum, count) => sum + count, 0);
    const dataSynced = totalItems * 1024 * (Math.random() * 10 + 5); // Random size per item

    // Simulate sync completion
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Complete sync
    await syncLog.complete(itemsSynced, dataSynced);

    // Update device status and last sync
    const device = await Device.findById(deviceId);
    if (device) {
      await device.updateSyncStatus('online');
      device.lastSyncedAt = new Date();
      await device.save();
    }

    logger.info(`Sync completed: ${syncLogId}`);

    // Create notification for sync completion
    try {
      const User = (await import('../models/User.js')).default;
      const user = await User.findById(userId);
      if (user) {
        if (!user.profile) user.profile = {};
        if (!user.profile.notifications) user.profile.notifications = [];
        
        const formatDataSize = (bytes) => {
          if (bytes < 1024) return `${bytes} B`;
          const kb = bytes / 1024;
          if (kb < 1024) return `${kb.toFixed(2)} KB`;
          const mb = kb / 1024;
          if (mb < 1024) return `${mb.toFixed(2)} MB`;
          return `${(mb / 1024).toFixed(2)} GB`;
        };
        
        user.profile.notifications.push({
          title: 'Sync Completed',
          message: `Successfully synced ${totalItems} items (${formatDataSize(dataSynced)}) across your devices.`,
          type: 'success',
          category: 'sync',
          priority: 'low',
          isRead: false,
          action: {
            type: 'internal',
            label: 'View Sync History',
            link: '/features/sync'
          },
          metadata: {
            resourceType: 'sync',
            resourceId: syncLogId.toString(),
            itemCount: totalItems,
            dataSize: dataSynced
          },
          createdAt: new Date()
        });
        
        await user.save();
        logger.info(`Notification created for sync completion: ${syncLogId}`);
      }
    } catch (notifError) {
      logger.error('Failed to create sync completion notification:', notifError);
    }

  } catch (error) {
    logger.error(`Sync failed: ${syncLogId}`, error);
    
    const syncLog = await SyncLog.findById(syncLogId);
    if (syncLog) {
      await syncLog.fail({
        message: error.message,
        code: 'SYNC_ERROR',
        stack: error.stack
      });
    }

    // Update device status
    const device = await Device.findById(deviceId);
    if (device) {
      await device.updateSyncStatus('offline');
    }

    // Create notification for sync failure
    try {
      const User = (await import('../models/User.js')).default;
      const user = await User.findById(userId);
      if (user) {
        if (!user.profile) user.profile = {};
        if (!user.profile.notifications) user.profile.notifications = [];
        
        user.profile.notifications.push({
          title: 'Sync Failed',
          message: `Unable to sync your data: ${error.message}`,
          type: 'alert',
          category: 'sync',
          priority: 'high',
          isRead: false,
          action: {
            type: 'internal',
            label: 'Retry Sync',
            link: '/features/sync'
          },
          metadata: {
            resourceType: 'sync',
            resourceId: syncLogId.toString(),
            error: error.message
          },
          createdAt: new Date()
        });
        
        await user.save();
        logger.info(`Notification created for sync failure: ${syncLogId}`);
      }
    } catch (notifError) {
      logger.error('Failed to create sync failure notification:', notifError);
    }
  }
}

export default router;
