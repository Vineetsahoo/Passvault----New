import mongoose from 'mongoose';

const { Schema } = mongoose;

const secureDocumentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  encryptionKey: {
    type: String,
    required: true
  },
  encryptionType: {
    type: String,
    enum: ['AES-256', 'AES-128'],
    default: 'AES-256'
  },
  category: {
    type: String,
    enum: ['document', 'image', 'video', 'audio', 'other'],
    default: 'document'
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
  sharedWith: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    email: String,
    permissions: {
      type: String,
      enum: ['view', 'download', 'edit'],
      default: 'view'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: null
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastAccessedAt: {
    type: Date,
    default: null
  },
  metadata: {
    checksum: String,
    thumbnailPath: String,
    compressionRatio: Number
  }
}, {
  timestamps: true
});

// Indexes for better query performance
secureDocumentSchema.index({ userId: 1, createdAt: -1 });
secureDocumentSchema.index({ userId: 1, category: 1 });
secureDocumentSchema.index({ userId: 1, tags: 1 });
secureDocumentSchema.index({ expiresAt: 1 });

// Method to check if document is expired
secureDocumentSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

const SecureDocument = mongoose.model('SecureDocument', secureDocumentSchema);

export default SecureDocument;
