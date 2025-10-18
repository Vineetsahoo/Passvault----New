import mongoose from 'mongoose';

const { Schema } = mongoose;

const alertSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  alertType: {
    type: String,
    enum: ['password_expiry', 'weak_password', 'breach', 'login_attempt', 'device_added', 'password_reuse', 'security_scan', 'document_expiry', 'card_expiry', 'pass_expiry', 'sync_failed', 'storage_limit', 'subscription_expiry'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Alert message is required']
  },
  relatedTo: {
    type: String, // e.g., 'password', 'document', 'device'
    default: null
  },
  relatedId: {
    type: Schema.Types.ObjectId,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  resolvedBy: {
    type: String,
    default: null
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String,
    default: null
  },
  actionLabel: {
    type: String,
    default: null
  },
  expiryDate: {
    type: Date,
    default: null
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  notificationSent: {
    email: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: false
    },
    sms: {
      type: Boolean,
      default: false
    }
  },
  reminderScheduled: {
    type: Boolean,
    default: false
  },
  reminderDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
alertSchema.index({ userId: 1, createdAt: -1 });
alertSchema.index({ userId: 1, alertType: 1 });
alertSchema.index({ userId: 1, severity: 1 });
alertSchema.index({ userId: 1, isRead: 1 });
alertSchema.index({ userId: 1, isResolved: 1 });
alertSchema.index({ expiryDate: 1 });

// Method to mark as read
alertSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to resolve alert
alertSchema.methods.resolve = function(resolvedBy = 'user') {
  this.isResolved = true;
  this.resolvedAt = new Date();
  this.resolvedBy = resolvedBy;
  return this.save();
};

// Static method to get unread count
alertSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ userId, isRead: false });
};

// Static method to get critical alerts
alertSchema.statics.getCriticalAlerts = function(userId) {
  return this.find({ 
    userId, 
    severity: 'critical', 
    isResolved: false 
  }).sort({ createdAt: -1 });
};

const Alert = mongoose.model('Alert', alertSchema);

export default Alert;
