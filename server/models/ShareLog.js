import mongoose from 'mongoose';

const shareLogSchema = new mongoose.Schema({
  sharedPass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SharedPass',
    required: true,
    index: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    enum: [
      'shared',
      'revoked',
      'modified',
      'accessed',
      'expired',
      'accepted',
      'declined',
      'renewed',
      'permissions-changed'
    ],
    required: true,
    index: true
  },
  recipient: {
    email: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  performedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: String,
    email: String
  },
  details: {
    previousValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    reason: String,
    changes: [String]
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    location: String,
    device: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes
shareLogSchema.index({ owner: 1, timestamp: -1 });
shareLogSchema.index({ sharedPass: 1, action: 1 });
shareLogSchema.index({ 'recipient.email': 1, timestamp: -1 });

// Static method to create log entry
shareLogSchema.statics.createLog = async function(logData) {
  try {
    const log = new this(logData);
    await log.save();
    return log;
  } catch (error) {
    console.error('Error creating share log:', error);
    throw error;
  }
};

// Static method to get activity summary
shareLogSchema.statics.getActivitySummary = async function(ownerId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(ownerId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 }
      }
    }
  ]);
};

const ShareLog = mongoose.model('ShareLog', shareLogSchema);

export default ShareLog;
