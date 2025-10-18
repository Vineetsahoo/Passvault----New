import mongoose from 'mongoose';

const { Schema } = mongoose;

const qrCodeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  qrType: {
    type: String,
    enum: ['wifi', 'password', 'url', 'text', 'contact', 'email', 'phone', 'payment'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  data: {
    type: Schema.Types.Mixed,
    required: true
  },
  encryptedData: {
    type: String,
    default: null
  },
  qrCodeImage: {
    type: String, // Base64 or URL
    default: null
  },
  isEncrypted: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  scanCount: {
    type: Number,
    default: 0
  },
  lastScannedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxScans: {
    type: Number,
    default: null // null means unlimited
  },
  scanHistory: [{
    scannedAt: {
      type: Date,
      default: Date.now
    },
    deviceInfo: String,
    ipAddress: String,
    location: {
      city: String,
      country: String
    }
  }],
  shareSettings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    sharedWith: [{
      email: String,
      sharedAt: {
        type: Date,
        default: Date.now
      }
    }],
    requirePassword: {
      type: Boolean,
      default: false
    },
    accessPassword: String
  },
  color: {
    type: String,
    default: '#000000'
  },
  backgroundColor: {
    type: String,
    default: '#FFFFFF'
  },
  size: {
    type: Number,
    default: 256
  }
}, {
  timestamps: true
});

// Indexes for better query performance
qrCodeSchema.index({ userId: 1, createdAt: -1 });
qrCodeSchema.index({ userId: 1, qrType: 1 });
qrCodeSchema.index({ userId: 1, category: 1 });
qrCodeSchema.index({ expiresAt: 1 });

// Method to check if QR code is expired
qrCodeSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Method to check if max scans reached
qrCodeSchema.methods.hasReachedMaxScans = function() {
  if (!this.maxScans) return false;
  return this.scanCount >= this.maxScans;
};

// Method to increment scan count
qrCodeSchema.methods.recordScan = function(deviceInfo, ipAddress, location) {
  this.scanCount += 1;
  this.lastScannedAt = new Date();
  this.scanHistory.push({
    scannedAt: new Date(),
    deviceInfo,
    ipAddress,
    location
  });
  return this.save();
};

const QRCode = mongoose.model('QRCode', qrCodeSchema);

export default QRCode;
