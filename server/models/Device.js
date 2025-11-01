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
  },
  // Verification fields
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    default: null
  },
  verificationCodeExpiry: {
    type: Date,
    default: null
  },
  verificationAttempts: {
    type: Number,
    default: 0
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  verificationMethod: {
    type: String,
    enum: ['email', 'manual', 'qr', null],
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
deviceSchema.index({ userId: 1, status: 1 });
deviceSchema.index({ userId: 1, lastActiveAt: -1 });

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

// Method to generate verification code
deviceSchema.methods.generateVerificationCode = function() {
  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.verificationCode = code;
  // Code expires in 10 minutes
  this.verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);
  this.verificationAttempts = 0;
  return code;
};

// Method to verify code
deviceSchema.methods.verifyCode = function(code) {
  // Check if code is expired
  if (this.verificationCodeExpiry < new Date()) {
    return { success: false, message: 'Verification code has expired' };
  }

  // Check attempts limit (max 5 attempts)
  if (this.verificationAttempts >= 5) {
    return { success: false, message: 'Too many failed attempts. Please request a new code.' };
  }

  // Verify code
  if (this.verificationCode === code) {
    this.isVerified = true;
    this.verifiedAt = new Date();
    this.verificationCode = null;
    this.verificationCodeExpiry = null;
    this.verificationAttempts = 0;
    this.isTrusted = true; // Auto-trust verified devices
    return { success: true, message: 'Device verified successfully' };
  } else {
    this.verificationAttempts += 1;
    return { 
      success: false, 
      message: `Invalid code. ${5 - this.verificationAttempts} attempts remaining.` 
    };
  }
};

const Device = mongoose.model('Device', deviceSchema);

export default Device;
