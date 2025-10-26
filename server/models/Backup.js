import mongoose from 'mongoose';

const { Schema } = mongoose;

const backupSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  backupType: {
    type: String,
    enum: ['manual', 'auto', 'scheduled'],
    default: 'manual'
  },
  backupStatus: {
    type: String,
    enum: ['initiated', 'in_progress', 'completed', 'failed', 'restoring'],
    default: 'initiated'
  },
  backupSize: {
    type: Number, // in bytes
    default: 0
  },
  itemCount: {
    type: Number,
    default: 0
  },
  dataTypes: [{
    type: String,
    enum: ['passwords', 'documents', 'settings', 'notes', 'qrcodes', 'devices']
  }],
  itemsBackedUp: {
    passwords: { type: Number, default: 0 },
    documents: { type: Number, default: 0 },
    settings: { type: Number, default: 0 },
    notes: { type: Number, default: 0 },
    qrcodes: { type: Number, default: 0 }
  },
  encryptionType: {
    type: String,
    enum: ['AES-256', 'AES-128'],
    default: 'AES-256'
  },
  compressed: {
    type: Boolean,
    default: true
  },
  compressionRatio: {
    type: Number,
    default: 1
  },
  location: {
    type: String,
    enum: ['cloud', 'local', 'hybrid'],
    default: 'cloud'
  },
  storagePath: {
    type: String,
    default: null
  },
  checksum: {
    type: String,
    default: null
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  duration: {
    type: Number, // in milliseconds
    default: 0
  },
  error: {
    message: String,
    code: String,
    stack: String
  },
  restorable: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null
  },
  metadata: {
    deviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Device'
    },
    appVersion: String,
    backupVersion: String
  },
  // Google Drive integration
  googleDrive: {
    enabled: { type: Boolean, default: false },
    fileId: String,
    fileName: String,
    webViewLink: String,
    uploadedAt: Date
  },
  // Selective backup options
  selectiveBackup: {
    enabled: { type: Boolean, default: false },
    selectedItems: {
      passwordIds: [{ type: Schema.Types.ObjectId, ref: 'Password' }],
      documentIds: [{ type: Schema.Types.ObjectId, ref: 'SecureDocument' }],
      qrcodeIds: [{ type: Schema.Types.ObjectId, ref: 'QRCode' }]
    }
  },
  // Device-specific backup
  deviceSpecific: {
    enabled: { type: Boolean, default: false },
    deviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Device'
    },
    deviceName: String
  },
  // Health metrics
  healthMetrics: {
    integrityScore: { type: Number, default: 100, min: 0, max: 100 },
    encryptionStrength: { type: Number, default: 256 },
    compressionEfficiency: { type: Number, default: 0 },
    lastVerified: Date,
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'failed', 'corrupted'],
      default: 'pending'
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
backupSchema.index({ userId: 1, createdAt: -1 });
backupSchema.index({ userId: 1, backupStatus: 1 });
backupSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to complete backup
backupSchema.methods.complete = function(backupSize, itemsBackedUp, storagePath) {
  this.backupStatus = 'completed';
  this.completedAt = new Date();
  this.backupSize = backupSize;
  this.itemsBackedUp = itemsBackedUp;
  this.itemCount = Object.values(itemsBackedUp).reduce((sum, count) => sum + count, 0);
  this.duration = this.completedAt - this.startedAt;
  if (storagePath) this.storagePath = storagePath;
  return this.save();
};

// Method to mark as failed
backupSchema.methods.fail = function(error) {
  this.backupStatus = 'failed';
  this.completedAt = new Date();
  this.error = {
    message: error.message,
    code: error.code || 'BACKUP_ERROR',
    stack: error.stack
  };
  this.duration = this.completedAt - this.startedAt;
  return this.save();
};

// Static method to get recent backups
backupSchema.statics.getRecentBackups = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-storagePath -checksum')
    .lean();
};

// Virtual for formatted size
backupSchema.virtual('formattedSize').get(function() {
  const bytes = this.backupSize;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
});

// Method to calculate backup health score
backupSchema.methods.calculateHealthScore = function() {
  let score = 100;
  const now = new Date();
  
  // Reduce score if backup failed
  if (this.backupStatus === 'failed') {
    score -= 50;
  }
  
  // Reduce score if not verified recently (older than 30 days)
  if (this.healthMetrics.lastVerified) {
    const daysSinceVerification = (now - this.healthMetrics.lastVerified) / (1000 * 60 * 60 * 24);
    if (daysSinceVerification > 30) {
      score -= 20;
    } else if (daysSinceVerification > 14) {
      score -= 10;
    }
  } else {
    score -= 15; // Never verified
  }
  
  // Reduce score if encryption is weak
  if (this.encryptionType !== 'AES-256') {
    score -= 10;
  }
  
  // Reduce score if verification failed
  if (this.healthMetrics.verificationStatus === 'failed') {
    score -= 30;
  } else if (this.healthMetrics.verificationStatus === 'corrupted') {
    score -= 70;
  }
  
  // Reduce score if backup is old (older than 60 days)
  const daysSinceBackup = (now - this.createdAt) / (1000 * 60 * 60 * 24);
  if (daysSinceBackup > 60) {
    score -= 15;
  } else if (daysSinceBackup > 30) {
    score -= 5;
  }
  
  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score));
  
  this.healthMetrics.integrityScore = score;
  return score;
};

// Static method to calculate overall health score for a user
backupSchema.statics.calculateOverallHealthScore = async function(userId) {
  const backups = await this.find({ 
    userId, 
    backupStatus: 'completed',
    restorable: true 
  }).sort({ createdAt: -1 }).limit(10);
  
  if (backups.length === 0) {
    return {
      score: 0,
      rating: 'No Backups',
      recommendation: 'Create your first backup to protect your data',
      metrics: {
        totalBackups: 0,
        healthyBackups: 0,
        avgAge: 0,
        lastBackupDays: null
      }
    };
  }
  
  // Calculate average health score
  let totalScore = 0;
  let healthyBackups = 0;
  
  for (const backup of backups) {
    const score = backup.calculateHealthScore();
    totalScore += score;
    if (score >= 80) healthyBackups++;
  }
  
  const avgScore = Math.round(totalScore / backups.length);
  
  // Calculate metrics
  const now = new Date();
  const lastBackup = backups[0];
  const lastBackupDays = Math.floor((now - lastBackup.createdAt) / (1000 * 60 * 60 * 24));
  
  const avgAge = backups.reduce((sum, b) => {
    return sum + (now - b.createdAt) / (1000 * 60 * 60 * 24);
  }, 0) / backups.length;
  
  // Determine rating and recommendation
  let rating, recommendation;
  
  if (avgScore >= 90) {
    rating = 'Excellent';
    recommendation = 'Your backups are in great shape! Keep up the good work.';
  } else if (avgScore >= 75) {
    rating = 'Good';
    recommendation = 'Your backups are healthy. Consider verifying older backups.';
  } else if (avgScore >= 60) {
    rating = 'Fair';
    recommendation = 'Some backups need attention. Run a verification check.';
  } else if (avgScore >= 40) {
    rating = 'Poor';
    recommendation = 'Several backups have issues. Create a new backup soon.';
  } else {
    rating = 'Critical';
    recommendation = 'Your backup health is critical! Create a new backup immediately.';
  }
  
  return {
    score: avgScore,
    rating,
    recommendation,
    metrics: {
      totalBackups: backups.length,
      healthyBackups,
      avgAge: Math.round(avgAge),
      lastBackupDays
    }
  };
};

const Backup = mongoose.model('Backup', backupSchema);

export default Backup;
