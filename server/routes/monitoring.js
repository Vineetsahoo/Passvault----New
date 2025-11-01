import express from 'express';
import mongoose from 'mongoose';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { validateMonitoringQuery } from '../utils/validation.js';
import Password from '../models/Password.js';
import SecureDocument from '../models/SecureDocument.js';
import QRCode from '../models/QRCode.js';
import Backup from '../models/Backup.js';
import User from '../models/User.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/monitoring/dashboard
 * @desc    Get comprehensive monitoring dashboard data
 * @access  Private
 */
router.get('/dashboard', validateMonitoringQuery, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    // Calculate date range based on period
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get all counts and statistics
    const [
      totalPasswords,
      totalDocuments,
      totalQRCodes,
      totalBackups,
      recentPasswords,
      recentDocuments,
      recentQRCodes,
      recentBackups,
      weakPasswords,
      expiredPasswords,
      user
    ] = await Promise.all([
      Password.countDocuments({ userId }),
      SecureDocument.countDocuments({ userId }),
      QRCode.countDocuments({ userId }),
      Backup.countDocuments({ userId }),
      Password.countDocuments({ userId, createdAt: { $gte: startDate } }),
      SecureDocument.countDocuments({ userId, createdAt: { $gte: startDate } }),
      QRCode.countDocuments({ userId, createdAt: { $gte: startDate } }),
      Backup.countDocuments({ userId, createdAt: { $gte: startDate } }),
      Password.countDocuments({ userId, strength: { $lt: 3 } }),
      Password.countDocuments({ userId, expiresAt: { $lt: now } }),
      User.findById(userId).select('profile.security')
    ]);

    // Calculate security score
    const securityScore = calculateSecurityScore({
      totalPasswords,
      weakPasswords,
      expiredPasswords,
      twoFactorEnabled: user?.twoFactorEnabled || false
    });

    // Get activity trends
    const activityTrends = await getActivityTrends(userId, startDate, period);

    // Get storage usage
    const storageUsage = await getStorageUsage(userId);

    // Get recent alerts
    const recentAlerts = await getRecentAlerts(userId, 5);

    res.json({
      success: true,
      message: 'Monitoring dashboard data retrieved successfully',
      data: {
        overview: {
          totalPasswords,
          totalDocuments,
          totalQRCodes,
          totalBackups,
          securityScore,
          storageUsed: storageUsage.used,
          storageTotal: storageUsage.total
        },
        activity: {
          period,
          passwords: recentPasswords,
          documents: recentDocuments,
          qrcodes: recentQRCodes,
          backups: recentBackups,
          total: recentPasswords + recentDocuments + recentQRCodes + recentBackups
        },
        security: {
          score: securityScore,
          weakPasswords,
          expiredPasswords,
          twoFactorEnabled: user?.twoFactorEnabled || false,
          lastPasswordChange: user?.profile?.security?.lastPasswordChange || null
        },
        trends: activityTrends,
        alerts: recentAlerts,
        storage: storageUsage
      }
    });

  } catch (error) {
    logger.error('Get monitoring dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve monitoring dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/monitoring/security
 * @desc    Get security monitoring metrics
 * @access  Private
 */
router.get('/security', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    // Get password security analysis
    const passwords = await Password.find({ userId })
      .select('strength createdAt updatedAt expiresAt isCompromised')
      .lean();

    const securityMetrics = {
      totalPasswords: passwords.length,
      byStrength: {
        weak: passwords.filter(p => p.strength < 3).length,
        moderate: passwords.filter(p => p.strength >= 3 && p.strength < 4).length,
        strong: passwords.filter(p => p.strength >= 4).length
      },
      expired: passwords.filter(p => p.expiresAt && new Date(p.expiresAt) < new Date()).length,
      compromised: passwords.filter(p => p.isCompromised).length,
      reused: await detectReusedPasswords(userId),
      oldPasswords: passwords.filter(p => {
        const daysSinceUpdate = Math.floor((new Date() - new Date(p.updatedAt)) / (1000 * 60 * 60 * 24));
        return daysSinceUpdate > 90;
      }).length
    };

    // Get user security settings
    const user = await User.findById(userId).select('twoFactorEnabled profile.security');

    const securitySettings = {
      twoFactorEnabled: user.twoFactorEnabled || false,
      backupCodesAvailable: user.profile?.security?.backupCodes || 0,
      recoveryEmailSet: !!user.profile?.security?.recoveryEmail,
      lastPasswordChange: user.profile?.security?.lastPasswordChange || null,
      failedLoginAttempts: user.loginAttempts || 0
    };

    // Calculate overall security score
    const securityScore = calculateDetailedSecurityScore(securityMetrics, securitySettings);

    // Get security recommendations
    const recommendations = generateSecurityRecommendations(securityMetrics, securitySettings);

    res.json({
      success: true,
      message: 'Security monitoring data retrieved successfully',
      data: {
        securityScore,
        metrics: securityMetrics,
        settings: securitySettings,
        recommendations
      }
    });

  } catch (error) {
    logger.error('Get security monitoring error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve security monitoring data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/monitoring/performance
 * @desc    Get system performance metrics
 * @access  Private
 */
router.get('/performance', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    // Get response times (simulated)
    const performanceMetrics = {
      averageLoadTime: Math.random() * 1000 + 500, // 500-1500ms
      apiResponseTime: Math.random() * 200 + 100, // 100-300ms
      databaseQueryTime: Math.random() * 50 + 20, // 20-70ms
      uptime: process.uptime(),
      lastChecked: new Date()
    };

    // Get resource usage
    const memoryUsage = process.memoryUsage();
    const resourceUsage = {
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
      },
      cpu: {
        usage: Math.random() * 30 + 10, // 10-40%
        processes: process.pid
      }
    };

    // Get sync status
    const lastBackup = await Backup.findOne({ userId })
      .sort({ createdAt: -1 })
      .select('createdAt status')
      .lean();

    const syncStatus = {
      lastBackup: lastBackup?.createdAt || null,
      backupStatus: lastBackup?.status || 'none',
      devicesSynced: 0, // TODO: Implement device sync tracking
      lastSyncedAt: null
    };

    res.json({
      success: true,
      message: 'Performance monitoring data retrieved successfully',
      data: {
        performance: performanceMetrics,
        resources: resourceUsage,
        sync: syncStatus
      }
    });

  } catch (error) {
    logger.error('Get performance monitoring error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve performance monitoring data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/monitoring/usage
 * @desc    Get usage statistics and patterns
 * @access  Private
 */
router.get('/usage', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get usage statistics
    const [
      passwordsCreated,
      documentsUploaded,
      qrcodesGenerated,
      backupsCreated
    ] = await Promise.all([
      Password.countDocuments({ userId, createdAt: { $gte: startDate } }),
      SecureDocument.countDocuments({ userId, createdAt: { $gte: startDate } }),
      QRCode.countDocuments({ userId, createdAt: { $gte: startDate } }),
      Backup.countDocuments({ userId, createdAt: { $gte: startDate } })
    ]);

    // Get most used features
    const featureUsage = {
      passwords: passwordsCreated,
      documents: documentsUploaded,
      qrcodes: qrcodesGenerated,
      backups: backupsCreated
    };

    const mostUsedFeature = Object.entries(featureUsage)
      .sort((a, b) => b[1] - a[1])[0];

    // Get user login patterns
    const user = await User.findById(userId).select('profile.security.loginHistory lastLogin');
    const loginHistory = user?.profile?.security?.loginHistory || [];
    
    const loginsByHour = new Array(24).fill(0);
    const loginsByDay = new Array(7).fill(0);
    
    loginHistory.forEach(login => {
      const date = new Date(login.timestamp);
      if (date >= startDate) {
        loginsByHour[date.getHours()]++;
        loginsByDay[date.getDay()]++;
      }
    });

    const peakUsageHour = loginsByHour.indexOf(Math.max(...loginsByHour));
    const peakUsageDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
      loginsByDay.indexOf(Math.max(...loginsByDay))
    ];

    res.json({
      success: true,
      message: 'Usage statistics retrieved successfully',
      data: {
        period,
        totalActivity: passwordsCreated + documentsUploaded + qrcodesGenerated + backupsCreated,
        featureUsage,
        mostUsedFeature: {
          feature: mostUsedFeature[0],
          count: mostUsedFeature[1]
        },
        patterns: {
          peakUsageHour,
          peakUsageDay,
          loginsByHour,
          loginsByDay
        }
      }
    });

  } catch (error) {
    logger.error('Get usage monitoring error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve usage statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/monitoring/alerts
 * @desc    Get system alerts and notifications
 * @access  Private
 */
router.get('/alerts', async (req, res) => {
  try {
    const { limit = 20, severity } = req.query;
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const alerts = await getRecentAlerts(userId, parseInt(limit), severity);

    // Group alerts by severity
    const alertsBySeverity = {
      critical: alerts.filter(a => a.severity === 'critical').length,
      high: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      low: alerts.filter(a => a.severity === 'low').length
    };

    res.json({
      success: true,
      message: 'Alerts retrieved successfully',
      data: {
        alerts,
        summary: alertsBySeverity,
        total: alerts.length
      }
    });

  } catch (error) {
    logger.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve alerts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate security score based on various factors
 */
function calculateSecurityScore({ totalPasswords, weakPasswords, expiredPasswords, twoFactorEnabled }) {
  let score = 100;

  // Deduct points for weak passwords
  if (totalPasswords > 0) {
    const weakPercentage = (weakPasswords / totalPasswords) * 100;
    score -= weakPercentage * 0.3;
  }

  // Deduct points for expired passwords
  if (totalPasswords > 0) {
    const expiredPercentage = (expiredPasswords / totalPasswords) * 100;
    score -= expiredPercentage * 0.2;
  }

  // Deduct points for not having 2FA
  if (!twoFactorEnabled) {
    score -= 10;
  }

  return Math.max(0, Math.round(score));
}

/**
 * Calculate detailed security score with more factors
 */
function calculateDetailedSecurityScore(metrics, settings) {
  let score = 100;

  // Password strength (40% weight)
  if (metrics.totalPasswords > 0) {
    const weakPercentage = (metrics.byStrength.weak / metrics.totalPasswords) * 100;
    score -= weakPercentage * 0.4;
  }

  // Expired passwords (15% weight)
  if (metrics.totalPasswords > 0) {
    const expiredPercentage = (metrics.expired / metrics.totalPasswords) * 100;
    score -= expiredPercentage * 0.15;
  }

  // Compromised passwords (20% weight)
  if (metrics.compromised > 0) {
    score -= metrics.compromised * 5;
  }

  // Reused passwords (15% weight)
  if (metrics.totalPasswords > 0) {
    const reusedPercentage = (metrics.reused / metrics.totalPasswords) * 100;
    score -= reusedPercentage * 0.15;
  }

  // Security settings (10% weight)
  if (!settings.twoFactorEnabled) score -= 5;
  if (!settings.recoveryEmailSet) score -= 3;
  if (settings.backupCodesAvailable < 3) score -= 2;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Get activity trends over time
 */
async function getActivityTrends(userId, startDate, period) {
  const passwords = await Password.find({ userId, createdAt: { $gte: startDate } })
    .select('createdAt')
    .lean();

  const documents = await SecureDocument.find({ userId, createdAt: { $gte: startDate } })
    .select('createdAt')
    .lean();

  const qrcodes = await QRCode.find({ userId, createdAt: { $gte: startDate } })
    .select('createdAt')
    .lean();

  // Group by date
  const trendData = {};
  const addToTrend = (item, type) => {
    const date = item.createdAt.toISOString().split('T')[0];
    if (!trendData[date]) {
      trendData[date] = { date, passwords: 0, documents: 0, qrcodes: 0 };
    }
    trendData[date][type]++;
  };

  passwords.forEach(p => addToTrend(p, 'passwords'));
  documents.forEach(d => addToTrend(d, 'documents'));
  qrcodes.forEach(q => addToTrend(q, 'qrcodes'));

  return Object.values(trendData).sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * Get storage usage information
 */
async function getStorageUsage(userId) {
  const documents = await SecureDocument.find({ userId }).select('fileSize').lean();
  const totalSize = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);

  return {
    used: totalSize,
    total: 5 * 1024 * 1024 * 1024, // 5GB limit
    percentage: (totalSize / (5 * 1024 * 1024 * 1024)) * 100,
    documents: documents.length
  };
}

/**
 * Get recent alerts
 */
async function getRecentAlerts(userId, limit = 5, severity = null) {
  const alerts = [];
  const now = new Date();

  // Check for weak passwords
  const weakPasswords = await Password.countDocuments({ userId, strength: { $lt: 3 } });
  if (weakPasswords > 0) {
    alerts.push({
      id: 'weak-passwords',
      type: 'security',
      severity: 'high',
      title: 'Weak Passwords Detected',
      message: `You have ${weakPasswords} weak password${weakPasswords > 1 ? 's' : ''} that should be strengthened`,
      timestamp: now,
      action: 'Review passwords'
    });
  }

  // Check for expired passwords
  const expiredPasswords = await Password.countDocuments({ 
    userId, 
    expiresAt: { $lt: now } 
  });
  if (expiredPasswords > 0) {
    alerts.push({
      id: 'expired-passwords',
      type: 'security',
      severity: 'medium',
      title: 'Expired Passwords',
      message: `${expiredPasswords} password${expiredPasswords > 1 ? 's have' : ' has'} expired`,
      timestamp: now,
      action: 'Update passwords'
    });
  }

  // Check for compromised passwords
  const compromisedPasswords = await Password.countDocuments({ userId, isCompromised: true });
  if (compromisedPasswords > 0) {
    alerts.push({
      id: 'compromised-passwords',
      type: 'security',
      severity: 'critical',
      title: 'Compromised Passwords',
      message: `${compromisedPasswords} password${compromisedPasswords > 1 ? 's have' : ' has'} been found in data breaches`,
      timestamp: now,
      action: 'Change immediately'
    });
  }

  // Check for 2FA
  const user = await User.findById(userId).select('twoFactorEnabled');
  if (!user.twoFactorEnabled) {
    alerts.push({
      id: 'no-2fa',
      type: 'security',
      severity: 'medium',
      title: 'Two-Factor Authentication Disabled',
      message: 'Enable 2FA for enhanced account security',
      timestamp: now,
      action: 'Enable 2FA'
    });
  }

  // Check for backup
  const lastBackup = await Backup.findOne({ userId }).sort({ createdAt: -1 }).select('createdAt');
  if (!lastBackup) {
    alerts.push({
      id: 'no-backup',
      type: 'backup',
      severity: 'low',
      title: 'No Backup Created',
      message: 'Create a backup to protect your data',
      timestamp: now,
      action: 'Create backup'
    });
  } else {
    const daysSinceBackup = Math.floor((now - lastBackup.createdAt) / (1000 * 60 * 60 * 24));
    if (daysSinceBackup > 30) {
      alerts.push({
        id: 'old-backup',
        type: 'backup',
        severity: 'low',
        title: 'Backup Outdated',
        message: `Last backup was ${daysSinceBackup} days ago`,
        timestamp: now,
        action: 'Create new backup'
      });
    }
  }

  // Filter by severity if specified
  const filteredAlerts = severity 
    ? alerts.filter(a => a.severity === severity)
    : alerts;

  // Sort by severity and limit
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return filteredAlerts
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    .slice(0, limit);
}

/**
 * Detect reused passwords
 */
async function detectReusedPasswords(userId) {
  const passwords = await Password.find({ userId }).select('password').lean();
  const passwordHashes = passwords.map(p => p.password);
  const uniqueHashes = new Set(passwordHashes);
  return passwordHashes.length - uniqueHashes.size;
}

/**
 * Generate security recommendations
 */
function generateSecurityRecommendations(metrics, settings) {
  const recommendations = [];

  if (metrics.byStrength.weak > 0) {
    recommendations.push({
      priority: 'high',
      category: 'passwords',
      title: 'Strengthen Weak Passwords',
      description: `You have ${metrics.byStrength.weak} weak passwords. Consider using the password generator to create stronger passwords.`,
      action: 'Review weak passwords'
    });
  }

  if (!settings.twoFactorEnabled) {
    recommendations.push({
      priority: 'high',
      category: 'security',
      title: 'Enable Two-Factor Authentication',
      description: 'Add an extra layer of security to your account by enabling 2FA.',
      action: 'Enable 2FA'
    });
  }

  if (metrics.reused > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'passwords',
      title: 'Eliminate Password Reuse',
      description: `You're reusing ${metrics.reused} passwords. Each account should have a unique password.`,
      action: 'Update reused passwords'
    });
  }

  if (metrics.expired > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'passwords',
      title: 'Update Expired Passwords',
      description: `${metrics.expired} passwords have expired. Update them to maintain security.`,
      action: 'Update expired passwords'
    });
  }

  if (!settings.recoveryEmailSet) {
    recommendations.push({
      priority: 'low',
      category: 'security',
      title: 'Set Recovery Email',
      description: 'Add a recovery email to help secure your account.',
      action: 'Add recovery email'
    });
  }

  if (settings.backupCodesAvailable < 3) {
    recommendations.push({
      priority: 'low',
      category: 'security',
      title: 'Generate Backup Codes',
      description: 'Generate backup codes for account recovery in case you lose access to your 2FA device.',
      action: 'Generate backup codes'
    });
  }

  return recommendations;
}

export default router;
