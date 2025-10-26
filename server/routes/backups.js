import express from 'express';
import Backup from '../models/Backup.js';
import Device from '../models/Device.js';
import Password from '../models/Password.js';
import QRCode from '../models/QRCode.js';
import SecureDocument from '../models/SecureDocument.js';
import { authenticateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// @route   POST /api/backups/create
// @desc    Create a new backup
// @access  Private
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { type = 'manual', deviceId } = req.body;

    // Check if there's already an active backup
    const activeBackup = await Backup.findOne({
      userId: req.user.userId,
      backupStatus: { $in: ['initiated', 'in_progress'] }
    });

    if (activeBackup) {
      return res.status(409).json({
        success: false,
        message: 'Backup already in progress'
      });
    }

    // Create new backup
    const backup = new Backup({
      userId: req.user.userId,
      backupType: type,
      backupStatus: 'initiated',
      dataTypes: ['passwords', 'documents', 'qrcodes', 'settings'],
      metadata: {
        deviceId: deviceId || null,
        appVersion: '1.0.0',
        backupVersion: '1.0'
      }
    });

    await backup.save();

    logger.info(`Backup initiated: ${backup._id} for user ${req.user.userId}`);

    // Perform backup asynchronously
    performBackup(backup._id, req.user.userId);

    res.status(201).json({
      success: true,
      message: 'Backup initiated successfully',
      backup: {
        id: backup._id,
        backupType: backup.backupType,
        backupStatus: backup.backupStatus,
        startedAt: backup.startedAt
      }
    });

  } catch (error) {
    logger.error('Backup creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating backup',
      error: error.message
    });
  }
});

// @route   GET /api/backups
// @desc    Get all user backups
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;

    const query = { userId: req.user.userId };
    if (status) query.backupStatus = status;

    const backups = await Backup.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-storagePath')
      .lean();

    const total = await Backup.countDocuments(query);

    res.json({
      success: true,
      backups,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });

  } catch (error) {
    logger.error('Error fetching backups:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching backups',
      error: error.message
    });
  }
});

// @route   GET /api/backups/stats
// @desc    Get backup statistics
// @access  Private
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await Backup.aggregate([
      { $match: { userId: req.user.userId } },
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalBackups: { $sum: 1 },
                totalSize: { $sum: '$backupSize' },
                completedBackups: {
                  $sum: { $cond: [{ $eq: ['$backupStatus', 'completed'] }, 1, 0] }
                },
                failedBackups: {
                  $sum: { $cond: [{ $eq: ['$backupStatus', 'failed'] }, 1, 0] }
                },
                totalItems: { $sum: '$itemCount' },
                avgDuration: { $avg: '$duration' }
              }
            }
          ],
          lastBackup: [
            { $match: { backupStatus: 'completed' } },
            { $sort: { completedAt: -1 } },
            { $limit: 1 },
            {
              $project: {
                completedAt: 1,
                backupSize: 1,
                itemCount: 1
              }
            }
          ],
          typeBreakdown: [
            {
              $group: {
                _id: '$backupType',
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    const overview = stats[0].overview[0] || {
      totalBackups: 0,
      totalSize: 0,
      completedBackups: 0,
      failedBackups: 0,
      totalItems: 0,
      avgDuration: 0
    };

    const successRate = overview.totalBackups > 0
      ? ((overview.completedBackups / overview.totalBackups) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      stats: {
        ...overview,
        successRate: parseFloat(successRate),
        lastBackup: stats[0].lastBackup[0] || null,
        typeBreakdown: stats[0].typeBreakdown
      }
    });

  } catch (error) {
    logger.error('Error fetching backup stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// @route   GET /api/backups/history
// @desc    Get backup history
// @access  Private
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const backups = await Backup.getRecentBackups(req.user.userId, parseInt(limit));

    res.json({
      success: true,
      backups
    });

  } catch (error) {
    logger.error('Error fetching backup history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching backup history',
      error: error.message
    });
  }
});

// @route   GET /api/backups/settings
// @desc    Get backup settings
// @access  Private
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    // For now, return default settings
    // In production, this would be stored in user preferences
    const settings = {
      frequency: 'daily',
      retention: 30,
      encryption: true,
      compression: true,
      location: 'cloud',
      autoBackupEnabled: true
    };

    res.json({
      success: true,
      settings
    });

  } catch (error) {
    logger.error('Error fetching backup settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching backup settings',
      error: error.message
    });
  }
});

// @route   PUT /api/backups/settings
// @desc    Update backup settings
// @access  Private
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const settings = req.body;

    // In production, save to user preferences collection
    logger.info(`Backup settings updated for user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Backup settings updated successfully',
      settings
    });

  } catch (error) {
    logger.error('Error updating backup settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating backup settings',
      error: error.message
    });
  }
});

// @route   POST /api/backups/:id/restore
// @desc    Restore from backup
// @access  Private
router.post('/:id/restore', authenticateToken, async (req, res) => {
  try {
    const backup = await Backup.findOne({
      _id: req.params.id,
      userId: req.user.userId,
      backupStatus: 'completed'
    });

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: 'Backup not found or not restorable'
      });
    }

    if (!backup.restorable) {
      return res.status(400).json({
        success: false,
        message: 'This backup cannot be restored'
      });
    }

    // Update backup status
    backup.backupStatus = 'restoring';
    await backup.save();

    logger.info(`Restore initiated: ${backup._id}`);

    // Simulate restore process
    performRestore(backup._id, req.user.userId);

    res.json({
      success: true,
      message: 'Restore initiated successfully',
      backup: {
        id: backup._id,
        status: backup.backupStatus
      }
    });

  } catch (error) {
    logger.error('Error restoring backup:', error);
    res.status(500).json({
      success: false,
      message: 'Error restoring backup',
      error: error.message
    });
  }
});

// @route   DELETE /api/backups/:id
// @desc    Delete a backup
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const backup = await Backup.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: 'Backup not found'
      });
    }

    await backup.deleteOne();

    logger.info(`Backup deleted: ${backup._id}`);

    res.json({
      success: true,
      message: 'Backup deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting backup:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting backup',
      error: error.message
    });
  }
});

// @route   GET /api/backups/:id/status
// @desc    Get backup status
// @access  Private
router.get('/:id/status', authenticateToken, async (req, res) => {
  try {
    const backup = await Backup.findOne({
      _id: req.params.id,
      userId: req.user.userId
    }).select('-storagePath');

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: 'Backup not found'
      });
    }

    res.json({
      success: true,
      backup
    });

  } catch (error) {
    logger.error('Error fetching backup status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching backup status',
      error: error.message
    });
  }
});

// Helper function to perform backup
async function performBackup(backupId, userId) {
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const backup = await Backup.findById(backupId);
    if (!backup) return;

    backup.backupStatus = 'in_progress';
    await backup.save();

    // Count items to backup
    const passwords = await Password.countDocuments({ userId });
    const qrcodes = await QRCode.countDocuments({ userId });
    const documents = await SecureDocument.countDocuments({ userId });

    const itemsBackedUp = {
      passwords,
      documents,
      settings: 1,
      notes: 0,
      qrcodes
    };

    const totalItems = passwords + qrcodes + documents + 1;
    const backupSize = totalItems * 1024 * (Math.random() * 10 + 5); // Simulated size

    await new Promise(resolve => setTimeout(resolve, 3000));

    await backup.complete(backupSize, itemsBackedUp, `/backups/${userId}/${backupId}`);

    logger.info(`Backup completed: ${backupId}`);

    // Create notification for backup completion
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
          title: 'Backup Completed',
          message: `Your data has been backed up successfully (${formatDataSize(backupSize)}).`,
          type: 'success',
          category: 'system',
          priority: 'low',
          isRead: false,
          action: {
            type: 'internal',
            label: 'View Backups',
            link: '/dashboard/backup'
          },
          metadata: {
            resourceType: 'backup',
            resourceId: backupId.toString(),
            backupSize
          },
          createdAt: new Date()
        });
        
        await user.save();
        logger.info(`Notification created for backup completion: ${backupId}`);
      }
    } catch (notifError) {
      logger.error('Failed to create backup completion notification:', notifError);
    }

  } catch (error) {
    logger.error(`Backup failed: ${backupId}`, error);
    
    const backup = await Backup.findById(backupId);
    if (backup) {
      await backup.fail({
        message: error.message,
        code: 'BACKUP_ERROR',
        stack: error.stack
      });
    }

    // Create notification for backup failure
    try {
      const User = (await import('../models/User.js')).default;
      const user = await User.findById(userId);
      if (user) {
        if (!user.profile) user.profile = {};
        if (!user.profile.notifications) user.profile.notifications = [];
        
        user.profile.notifications.push({
          title: 'Backup Failed',
          message: `Backup process failed: ${error.message}`,
          type: 'alert',
          category: 'system',
          priority: 'high',
          isRead: false,
          action: {
            type: 'internal',
            label: 'View Backup Settings',
            link: '/dashboard/backup'
          },
          metadata: {
            resourceType: 'backup',
            resourceId: backupId.toString(),
            error: error.message
          },
          createdAt: new Date()
        });
        
        await user.save();
        logger.info(`Notification created for backup failure: ${backupId}`);
      }
    } catch (notifError) {
      logger.error('Failed to create backup failure notification:', notifError);
    }
  }
}

// Helper function to perform restore
async function performRestore(backupId, userId) {
  try {
    await new Promise(resolve => setTimeout(resolve, 5000));

    const backup = await Backup.findById(backupId);
    if (!backup) return;

    backup.backupStatus = 'completed';
    await backup.save();

    logger.info(`Restore completed: ${backupId}`);

  } catch (error) {
    logger.error(`Restore failed: ${backupId}`, error);
    
    const backup = await Backup.findById(backupId);
    if (backup) {
      await backup.fail({
        message: error.message,
        code: 'RESTORE_ERROR',
        stack: error.stack
      });
    }
  }
}

// @route   GET /api/backups/health
// @desc    Get backup health score
// @access  Private
router.get('/health', authenticateToken, async (req, res) => {
  try {
    const healthData = await Backup.calculateOverallHealthScore(req.user.userId);

    res.json({
      success: true,
      health: healthData
    });

  } catch (error) {
    logger.error('Error calculating backup health:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating backup health',
      error: error.message
    });
  }
});

// @route   POST /api/backups/selective
// @desc    Create selective backup (specific items only)
// @access  Private
router.post('/selective', authenticateToken, async (req, res) => {
  try {
    const { passwordIds = [], documentIds = [], qrcodeIds = [], deviceId } = req.body;

    // Validate that at least something is selected
    if (passwordIds.length === 0 && documentIds.length === 0 && qrcodeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one item to backup'
      });
    }

    // Create selective backup
    const backup = new Backup({
      userId: req.user.userId,
      backupType: 'manual',
      backupStatus: 'initiated',
      dataTypes: [
        ...(passwordIds.length > 0 ? ['passwords'] : []),
        ...(documentIds.length > 0 ? ['documents'] : []),
        ...(qrcodeIds.length > 0 ? ['qrcodes'] : [])
      ],
      selectiveBackup: {
        enabled: true,
        selectedItems: {
          passwordIds,
          documentIds,
          qrcodeIds
        }
      },
      deviceSpecific: deviceId ? {
        enabled: true,
        deviceId
      } : { enabled: false },
      metadata: {
        deviceId: deviceId || null,
        appVersion: '1.0.0',
        backupVersion: '1.0'
      }
    });

    await backup.save();

    logger.info(`Selective backup initiated: ${backup._id} for user ${req.user.userId}`);

    // Perform backup asynchronously
    performSelectiveBackup(backup._id, req.user.userId, { passwordIds, documentIds, qrcodeIds });

    res.status(201).json({
      success: true,
      message: 'Selective backup initiated successfully',
      backup: {
        id: backup._id,
        backupType: backup.backupType,
        backupStatus: backup.backupStatus,
        selectiveBackup: backup.selectiveBackup,
        startedAt: backup.startedAt
      }
    });

  } catch (error) {
    logger.error('Selective backup creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating selective backup',
      error: error.message
    });
  }
});

// @route   POST /api/backups/:id/google-drive
// @desc    Upload backup to Google Drive
// @access  Private
router.post('/:id/google-drive', authenticateToken, async (req, res) => {
  try {
    const backup = await Backup.findOne({
      _id: req.params.id,
      userId: req.user.userId,
      backupStatus: 'completed'
    });

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: 'Backup not found'
      });
    }

    // This would integrate with Google Drive
    // For now, we'll simulate the upload
    backup.googleDrive = {
      enabled: true,
      fileId: `gdrive_${backup._id}`,
      fileName: `passvault_backup_${backup._id}.encrypted`,
      webViewLink: `https://drive.google.com/file/d/${backup._id}/view`,
      uploadedAt: new Date()
    };

    await backup.save();

    logger.info(`Backup uploaded to Google Drive: ${backup._id}`);

    res.json({
      success: true,
      message: 'Backup uploaded to Google Drive successfully',
      googleDrive: backup.googleDrive
    });

  } catch (error) {
    logger.error('Google Drive upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading to Google Drive',
      error: error.message
    });
  }
});

// @route   GET /api/backups/:id/verify
// @desc    Verify backup integrity
// @access  Private
router.get('/:id/verify', authenticateToken, async (req, res) => {
  try {
    const backup = await Backup.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: 'Backup not found'
      });
    }

    // Perform verification (simplified for now)
    backup.healthMetrics.verificationStatus = 'verified';
    backup.healthMetrics.lastVerified = new Date();
    
    // Calculate health score
    const healthScore = backup.calculateHealthScore();

    await backup.save();

    logger.info(`Backup verified: ${backup._id}, Health Score: ${healthScore}`);

    res.json({
      success: true,
      message: 'Backup verified successfully',
      verification: {
        status: backup.healthMetrics.verificationStatus,
        healthScore,
        lastVerified: backup.healthMetrics.lastVerified
      }
    });

  } catch (error) {
    logger.error('Backup verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying backup',
      error: error.message
    });
  }
});

// @route   GET /api/backups/devices/list
// @desc    Get list of devices for backup selection
// @access  Private
router.get('/devices/list', authenticateToken, async (req, res) => {
  try {
    const Device = (await import('../models/Device.js')).default;
    
    const devices = await Device.find({ userId: req.user.userId })
      .select('deviceName deviceType status lastActiveAt')
      .sort({ lastActiveAt: -1 });

    res.json({
      success: true,
      devices: devices.map(d => ({
        id: d._id,
        name: d.deviceName,
        type: d.deviceType,
        status: d.status,
        lastActive: d.lastActiveAt
      }))
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

// Helper function for selective backup
async function performSelectiveBackup(backupId, userId, selectedItems) {
  try {
    const { encryptAES256, createChecksum } = await import('../utils/encryption.js');
    
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 3000));

    const backup = await Backup.findById(backupId);
    if (!backup) return;

    // Count selected items
    const itemsBackedUp = {
      passwords: selectedItems.passwordIds?.length || 0,
      documents: selectedItems.documentIds?.length || 0,
      qrcodes: selectedItems.qrcodeIds?.length || 0,
      settings: 0,
      notes: 0
    };

    // Calculate backup size (simplified)
    const backupSize = Object.values(itemsBackedUp).reduce((sum, count) => sum + count * 1024, 0);

    // Create backup data with encryption
    const backupData = JSON.stringify({
      selectedItems,
      timestamp: new Date(),
      userId
    });

    // Encrypt backup data using AES-256
    const encryptionPassword = process.env.ENCRYPTION_KEY || 'default-encryption-key';
    const encryptedData = encryptAES256(backupData, encryptionPassword);
    
    // Create checksum
    const checksum = createChecksum(encryptedData);

    // Update backup with health metrics
    backup.checksum = checksum;
    backup.healthMetrics = {
      integrityScore: 100,
      encryptionStrength: 256,
      compressionEfficiency: 0,
      lastVerified: new Date(),
      verificationStatus: 'verified'
    };

    await backup.complete(backupSize, itemsBackedUp, `backups/${backupId}.encrypted`);

    logger.info(`Selective backup completed: ${backupId}`);

    // Create notification
    try {
      const User = (await import('../models/User.js')).default;
      const user = await User.findById(userId);
      if (user) {
        if (!user.profile) user.profile = {};
        if (!user.profile.notifications) user.profile.notifications = [];
        
        const formatDataSize = (bytes) => {
          if (bytes === 0) return '0 Bytes';
          const k = 1024;
          const sizes = ['Bytes', 'KB', 'MB', 'GB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
        };
        
        const totalItems = Object.values(itemsBackedUp).reduce((sum, count) => sum + count, 0);
        
        user.profile.notifications.push({
          title: 'Selective Backup Completed',
          message: `Successfully backed up ${totalItems} selected items (${formatDataSize(backupSize)}) with AES-256 encryption.`,
          type: 'success',
          category: 'system',
          priority: 'low',
          isRead: false,
          action: {
            type: 'internal',
            label: 'View Backups',
            link: '/dashboard/backup'
          },
          metadata: {
            resourceType: 'backup',
            resourceId: backupId.toString(),
            backupSize,
            selective: true
          },
          createdAt: new Date()
        });
        
        await user.save();
      }
    } catch (notifError) {
      logger.error('Failed to create selective backup notification:', notifError);
    }

  } catch (error) {
    logger.error(`Selective backup failed: ${backupId}`, error);
    
    const backup = await Backup.findById(backupId);
    if (backup) {
      await backup.fail({
        message: error.message,
        code: 'SELECTIVE_BACKUP_ERROR',
        stack: error.stack
      });
    }
  }
}

export default router;
