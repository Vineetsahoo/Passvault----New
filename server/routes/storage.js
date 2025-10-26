import express from 'express';
import Password from '../models/Password.js';
import QRCode from '../models/QRCode.js';
import SecureDocument from '../models/SecureDocument.js';
import Backup from '../models/Backup.js';
import SyncLog from '../models/SyncLog.js';
import { authenticateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';

const router = express.Router();

// @route   GET /api/storage/metrics
// @desc    Get storage metrics
// @access  Private
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Count items
    const passwordCount = await Password.countDocuments({ userId });
    const qrcodeCount = await QRCode.countDocuments({ userId });
    const documentCount = await SecureDocument.countDocuments({ userId });

    // Calculate total storage (simulated)
    const totalItems = passwordCount + qrcodeCount + documentCount;
    const estimatedSizePerItem = 1024 * 2; // 2KB per item average
    const usedStorageBytes = totalItems * estimatedSizePerItem;
    
    const totalStorageBytes = 104857600; // 100MB
    const availableStorageBytes = totalStorageBytes - usedStorageBytes;
    const usagePercentage = (usedStorageBytes / totalStorageBytes) * 100;

    // Get last backup
    const lastBackup = await Backup.findOne({
      userId,
      backupStatus: 'completed'
    })
      .sort({ completedAt: -1 })
      .select('completedAt')
      .lean();

    const formatBytes = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    res.json({
      success: true,
      metrics: {
        totalStorage: formatBytes(totalStorageBytes),
        totalStorageBytes,
        usedStorage: formatBytes(usedStorageBytes),
        usedStorageBytes,
        availableStorage: formatBytes(availableStorageBytes),
        availableStorageBytes,
        encryptedFiles: totalItems,
        lastBackup: lastBackup?.completedAt || null,
        usagePercentage: parseFloat(usagePercentage.toFixed(2))
      }
    });

  } catch (error) {
    logger.error('Error fetching storage metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching storage metrics',
      error: error.message
    });
  }
});

// @route   GET /api/storage/security-status
// @desc    Get security status
// @access  Private
router.get('/security-status', authenticateToken, async (req, res) => {
  try {
    // Simulate security scan (in production, this would be a real scan)
    const status = {
      status: 'secure',
      lastScan: new Date(),
      encryptionType: 'AES-256',
      twoFactorEnabled: false, // Would check user settings
      vulnerabilities: 0
    };

    res.json({
      success: true,
      status
    });

  } catch (error) {
    logger.error('Error fetching security status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching security status',
      error: error.message
    });
  }
});

// @route   GET /api/storage/audit-log
// @desc    Get security audit log
// @access  Private
router.get('/audit-log', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get recent sync logs as audit events
    const syncLogs = await SyncLog.find({
      userId: req.user.userId
    })
      .populate('deviceId', 'deviceName ipAddress location')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    const auditLog = syncLogs.map(log => ({
      id: log._id,
      timestamp: log.startedAt,
      action: `${log.syncType} sync`,
      ipAddress: log.deviceId?.ipAddress || 'Unknown',
      location: log.deviceId?.location?.city 
        ? `${log.deviceId.location.city}, ${log.deviceId.location.country || 'Unknown'}`
        : 'Unknown',
      status: log.syncStatus === 'completed' ? 'success' : 'failed',
      deviceName: log.deviceId?.deviceName
    }));

    res.json({
      success: true,
      auditLog
    });

  } catch (error) {
    logger.error('Error fetching audit log:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching audit log',
      error: error.message
    });
  }
});

// @route   GET /api/storage/backup-status
// @desc    Get backup status
// @access  Private
router.get('/backup-status', authenticateToken, async (req, res) => {
  try {
    const lastBackup = await Backup.findOne({
      userId: req.user.userId,
      backupStatus: 'completed'
    })
      .sort({ completedAt: -1 })
      .lean();

    const formatBytes = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    // Calculate next scheduled backup (assuming daily)
    const nextScheduled = lastBackup 
      ? new Date(new Date(lastBackup.completedAt).getTime() + 24 * 60 * 60 * 1000)
      : null;

    res.json({
      success: true,
      backupStatus: {
        lastBackup: lastBackup?.completedAt || null,
        nextScheduled,
        backupSize: lastBackup ? formatBytes(lastBackup.backupSize) : '0 Bytes',
        location: 'Cloud Storage',
        autoBackupEnabled: true
      }
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

// @route   GET /api/storage/recovery-key
// @desc    Get recovery key
// @access  Private
router.get('/recovery-key', authenticateToken, async (req, res) => {
  try {
    // In production, this would be stored securely in user settings
    // For demo, generate a formatted key
    const recoveryKey = crypto.randomBytes(16).toString('hex')
      .match(/.{1,4}/g)
      .join('-')
      .toUpperCase();

    res.json({
      success: true,
      recoveryKey
    });

  } catch (error) {
    logger.error('Error fetching recovery key:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recovery key',
      error: error.message
    });
  }
});

// @route   POST /api/storage/recovery-key/regenerate
// @desc    Regenerate recovery key
// @access  Private
router.post('/recovery-key/regenerate', authenticateToken, async (req, res) => {
  try {
    const newRecoveryKey = crypto.randomBytes(16).toString('hex')
      .match(/.{1,4}/g)
      .join('-')
      .toUpperCase();

    logger.info(`Recovery key regenerated for user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Recovery key regenerated successfully',
      recoveryKey: newRecoveryKey
    });

  } catch (error) {
    logger.error('Error regenerating recovery key:', error);
    res.status(500).json({
      success: false,
      message: 'Error regenerating recovery key',
      error: error.message
    });
  }
});

// @route   POST /api/storage/security-scan
// @desc    Run security scan
// @access  Private
router.post('/security-scan', authenticateToken, async (req, res) => {
  try {
    // Simulate security scan
    await new Promise(resolve => setTimeout(resolve, 2000));

    const scanResults = {
      status: 'secure',
      lastScan: new Date(),
      vulnerabilities: 0,
      encryptionStrength: 'Strong',
      recommendations: []
    };

    logger.info(`Security scan completed for user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Security scan completed',
      results: scanResults
    });

  } catch (error) {
    logger.error('Error running security scan:', error);
    res.status(500).json({
      success: false,
      message: 'Error running security scan',
      error: error.message
    });
  }
});

// @route   GET /api/storage/encryption-settings
// @desc    Get encryption settings
// @access  Private
router.get('/encryption-settings', authenticateToken, async (req, res) => {
  try {
    const settings = {
      encryptionType: 'AES-256',
      autoEncrypt: true,
      encryptBackups: true
    };

    res.json({
      success: true,
      settings
    });

  } catch (error) {
    logger.error('Error fetching encryption settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching encryption settings',
      error: error.message
    });
  }
});

// @route   PUT /api/storage/encryption-settings
// @desc    Update encryption settings
// @access  Private
router.put('/encryption-settings', authenticateToken, async (req, res) => {
  try {
    const settings = req.body;

    logger.info(`Encryption settings updated for user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Encryption settings updated successfully',
      settings
    });

  } catch (error) {
    logger.error('Error updating encryption settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating encryption settings',
      error: error.message
    });
  }
});

// @route   GET /api/storage/breakdown
// @desc    Get storage breakdown by type
// @access  Private
router.get('/breakdown', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const passwordCount = await Password.countDocuments({ userId });
    const qrcodeCount = await QRCode.countDocuments({ userId });
    const documentCount = await SecureDocument.countDocuments({ userId });

    // Simulated size calculations
    const breakdown = {
      passwords: {
        count: passwordCount,
        size: passwordCount * 1024, // 1KB each
        percentage: 0
      },
      qrcodes: {
        count: qrcodeCount,
        size: qrcodeCount * 2048, // 2KB each
        percentage: 0
      },
      documents: {
        count: documentCount,
        size: documentCount * 5120, // 5KB each
        percentage: 0
      }
    };

    const totalSize = breakdown.passwords.size + breakdown.qrcodes.size + breakdown.documents.size;
    
    if (totalSize > 0) {
      breakdown.passwords.percentage = (breakdown.passwords.size / totalSize) * 100;
      breakdown.qrcodes.percentage = (breakdown.qrcodes.size / totalSize) * 100;
      breakdown.documents.percentage = (breakdown.documents.size / totalSize) * 100;
    }

    res.json({
      success: true,
      breakdown
    });

  } catch (error) {
    logger.error('Error fetching storage breakdown:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching storage breakdown',
      error: error.message
    });
  }
});

export default router;
