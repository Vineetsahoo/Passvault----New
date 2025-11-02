import mongoose from 'mongoose';

const shareTemplateSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  accessLevel: {
    type: String,
    enum: ['read', 'edit'],
    default: 'read',
    required: true
  },
  expiryDays: {
    type: Number,
    default: 30,
    min: 1,
    max: 365
  },
  restrictions: [{
    type: String,
    enum: ['no-download', 'no-print', 'no-share', 'no-export', 'view-only']
  }],
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
  isDefault: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  },
  settings: {
    requireConfirmation: {
      type: Boolean,
      default: false
    },
    notifyOnAccess: {
      type: Boolean,
      default: true
    },
    allowExtension: {
      type: Boolean,
      default: false
    },
    maxShares: {
      type: Number,
      default: null
    }
  }
}, {
  timestamps: true
});

// Index for performance
shareTemplateSchema.index({ owner: 1, isDefault: 1 });

// Pre-save to set permissions based on access level and restrictions
shareTemplateSchema.pre('save', function(next) {
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

// Method to increment usage count
shareTemplateSchema.methods.incrementUsage = async function() {
  this.usageCount += 1;
  await this.save();
};

const ShareTemplate = mongoose.model('ShareTemplate', shareTemplateSchema);

export default ShareTemplate;
