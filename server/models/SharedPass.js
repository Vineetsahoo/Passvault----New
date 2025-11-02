import mongoose from 'mongoose';

const sharedPassSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  pass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QRCode',
    required: true,
    index: true
  },
  recipient: {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    name: {
      type: String,
      trim: true
    }
  },
  accessLevel: {
    type: String,
    enum: ['read', 'edit'],
    default: 'read',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'revoked', 'expired'],
    default: 'pending',
    required: true,
    index: true
  },
  permissions: {
    canView: {
      type: Boolean,
      default: true
    },
    canEdit: {
      type: Boolean,
      default: false
    },
    canDownload: {
      type: Boolean,
      default: true
    },
    canPrint: {
      type: Boolean,
      default: true
    },
    canShare: {
      type: Boolean,
      default: false
    }
  },
  restrictions: [{
    type: String,
    enum: ['no-download', 'no-print', 'no-share', 'no-export', 'view-only']
  }],
  shareMethod: {
    type: String,
    enum: ['email', 'link', 'batch'],
    default: 'email'
  },
  shareLink: {
    token: {
      type: String,
      unique: true,
      sparse: true
    },
    expiresAt: {
      type: Date
    },
    maxUses: {
      type: Number,
      default: null
    },
    usedCount: {
      type: Number,
      default: 0
    }
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShareTemplate',
    default: null
  },
  expiresAt: {
    type: Date,
    default: null,
    index: true
  },
  lastAccessed: {
    type: Date,
    default: null
  },
  accessCount: {
    type: Number,
    default: 0
  },
  notification: {
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: {
      type: Date
    },
    reminderSent: {
      type: Boolean,
      default: false
    }
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    location: String
  }
}, {
  timestamps: true
});

// Indexes for performance
sharedPassSchema.index({ owner: 1, status: 1 });
sharedPassSchema.index({ 'recipient.email': 1, status: 1 });
sharedPassSchema.index({ 'shareLink.token': 1 });
sharedPassSchema.index({ expiresAt: 1 });

// Virtual for checking if expired
sharedPassSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Auto-update status if expired
sharedPassSchema.pre('save', function(next) {
  if (this.expiresAt && new Date() > this.expiresAt && this.status === 'active') {
    this.status = 'expired';
  }
  
  // Set permissions based on access level
  if (this.accessLevel === 'read') {
    this.permissions.canEdit = false;
    this.permissions.canShare = false;
  } else if (this.accessLevel === 'edit') {
    this.permissions.canEdit = true;
  }
  
  // Apply restrictions
  if (this.restrictions.includes('no-download')) {
    this.permissions.canDownload = false;
  }
  if (this.restrictions.includes('no-print')) {
    this.permissions.canPrint = false;
  }
  if (this.restrictions.includes('no-share')) {
    this.permissions.canShare = false;
  }
  if (this.restrictions.includes('view-only')) {
    this.permissions.canEdit = false;
    this.permissions.canDownload = false;
    this.permissions.canPrint = false;
    this.permissions.canShare = false;
  }
  
  next();
});

// Method to check if can be accessed
sharedPassSchema.methods.canAccess = function() {
  if (this.status === 'revoked') return false;
  if (this.status === 'expired') return false;
  if (this.expiresAt && new Date() > this.expiresAt) {
    this.status = 'expired';
    return false;
  }
  return true;
};

// Method to record access
sharedPassSchema.methods.recordAccess = async function() {
  this.lastAccessed = new Date();
  this.accessCount += 1;
  if (this.status === 'pending') {
    this.status = 'active';
  }
  await this.save();
};

// Static method to clean up expired shares
sharedPassSchema.statics.cleanupExpired = async function() {
  const now = new Date();
  return this.updateMany(
    {
      status: 'active',
      expiresAt: { $lt: now }
    },
    {
      $set: { status: 'expired' }
    }
  );
};

// Ensure JSON includes virtuals
sharedPassSchema.set('toJSON', { virtuals: true });
sharedPassSchema.set('toObject', { virtuals: true });

const SharedPass = mongoose.model('SharedPass', sharedPassSchema);

export default SharedPass;
