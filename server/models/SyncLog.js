import mongoose from 'mongoose';

const { Schema } = mongoose;

const syncLogSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  deviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  syncType: {
    type: String,
    enum: ['manual', 'auto', 'scheduled', 'forced'],
    default: 'auto'
  },
  syncStatus: {
    type: String,
    enum: ['initiated', 'in_progress', 'completed', 'failed', 'partial'],
    default: 'initiated'
  },
  dataTypes: [{
    type: String,
    enum: ['passwords', 'documents', 'settings', 'notes', 'devices', 'qrcodes']
  }],
  itemsSynced: {
    passwords: { type: Number, default: 0 },
    documents: { type: Number, default: 0 },
    settings: { type: Number, default: 0 },
    notes: { type: Number, default: 0 },
    qrcodes: { type: Number, default: 0 }
  },
  totalItems: {
    type: Number,
    default: 0
  },
  dataSynced: {
    type: Number, // in bytes
    default: 0
  },
  duration: {
    type: Number, // in milliseconds
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  error: {
    message: String,
    code: String,
    stack: String
  },
  conflicts: [{
    itemType: String,
    itemId: Schema.Types.ObjectId,
    conflictType: String, // 'version', 'deletion', 'modification'
    resolution: String, // 'server_wins', 'client_wins', 'manual'
    resolvedAt: Date
  }],
  metadata: {
    networkType: String, // 'wifi', '4g', '5g', 'ethernet'
    batteryLevel: Number,
    storageAvailable: Number
  }
}, {
  timestamps: true
});

// Indexes for better query performance
syncLogSchema.index({ userId: 1, createdAt: -1 });
syncLogSchema.index({ userId: 1, deviceId: 1 });
syncLogSchema.index({ userId: 1, syncStatus: 1 });
syncLogSchema.index({ startedAt: -1 });

// Method to complete sync
syncLogSchema.methods.complete = function(itemsSynced, dataSynced) {
  this.syncStatus = 'completed';
  this.completedAt = new Date();
  this.itemsSynced = itemsSynced;
  this.dataSynced = dataSynced;
  this.duration = this.completedAt - this.startedAt;
  this.totalItems = Object.values(itemsSynced).reduce((sum, count) => sum + count, 0);
  return this.save();
};

// Method to mark as failed
syncLogSchema.methods.fail = function(error) {
  this.syncStatus = 'failed';
  this.completedAt = new Date();
  this.error = {
    message: error.message,
    code: error.code || 'SYNC_ERROR',
    stack: error.stack
  };
  this.duration = this.completedAt - this.startedAt;
  return this.save();
};

// Static method to get recent sync history
syncLogSchema.statics.getRecentSyncs = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('deviceId', 'deviceName deviceType');
};

const SyncLog = mongoose.model('SyncLog', syncLogSchema);

export default SyncLog;
