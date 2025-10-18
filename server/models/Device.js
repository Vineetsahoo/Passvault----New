import mongoose from 'mongoose';

const { Schema } = mongoose;

const deviceSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  deviceName: {
    type: String,
    required: [true, 'Device name is required'],
    trim: true
  },
  deviceType: {
    type: String,
    enum: ['laptop', 'mobile', 'tablet', 'desktop', 'other'],
    required: true
  },
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  operatingSystem: {
    type: String,
    default: ''
  },
  browser: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: ''
  },
  location: {
    city: String,
    country: String,
    region: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'syncing'],
    default: 'offline'
  },
  lastSyncedAt: {
    type: Date,
    default: null
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  syncEnabled: {
    type: Boolean,
    default: true
  },
  autoSyncEnabled: {
    type: Boolean,
    default: true
  },
  syncSettings: {
    passwords: {
      type: Boolean,
      default: true
    },
    documents: {
      type: Boolean,
      default: true
    },
    settings: {
      type: Boolean,
      default: true
    },
    notes: {
      type: Boolean,
      default: false
    }
  },
  isTrusted: {
    type: Boolean,
    default: false
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  notificationToken: {
    type: String,
    default: null
  },
  deviceFingerprint: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
deviceSchema.index({ userId: 1, status: 1 });
deviceSchema.index({ userId: 1, lastActiveAt: -1 });
deviceSchema.index({ deviceId: 1 }, { unique: true });

// Method to update last active time
deviceSchema.methods.updateLastActive = function() {
  this.lastActiveAt = new Date();
  return this.save();
};

// Method to update sync status
deviceSchema.methods.updateSyncStatus = function(status) {
  this.status = status;
  if (status === 'online' || status === 'syncing') {
    this.lastSyncedAt = new Date();
  }
  return this.save();
};

const Device = mongoose.model('Device', deviceSchema);

export default Device;
