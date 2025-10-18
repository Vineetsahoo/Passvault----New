import mongoose from 'mongoose';
import crypto from 'crypto';

const { Schema } = mongoose;

const passwordSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Password title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  website: {
    type: String,
    trim: true,
    maxlength: [200, 'Website URL cannot exceed 200 characters']
  },
  username: {
    type: String,
    trim: true,
    maxlength: [100, 'Username cannot exceed 100 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [100, 'Email cannot exceed 100 characters']
  },
  encryptedPassword: {
    type: String,
    required: [true, 'Password is required']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    default: ''
  },
  category: {
    type: String,
    enum: ['social', 'email', 'finance', 'work', 'personal', 'shopping', 'entertainment', 'other'],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  isFavorite: {
    type: Boolean,
    default: false
  },
  strength: {
    type: String,
    enum: ['weak', 'medium', 'strong', 'very-strong'],
    default: 'medium'
  },
  lastUsed: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  },
  isCompromised: {
    type: Boolean,
    default: false
  },
  compromisedAt: {
    type: Date,
    default: null
  },
  sharedWith: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permissions: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    encryptedData: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    createdFrom: {
      type: String,
      enum: ['web', 'mobile', 'extension', 'import'],
      default: 'web'
    },
    lastModifiedFrom: {
      type: String,
      enum: ['web', 'mobile', 'extension'],
      default: 'web'
    },
    version: {
      type: Number,
      default: 1
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.encryptedPassword;
      delete ret.attachments;
      return ret;
    }
  }
});

// Indexes for better query performance
passwordSchema.index({ userId: 1, title: 1 });
passwordSchema.index({ userId: 1, category: 1 });
passwordSchema.index({ userId: 1, isFavorite: 1 });
passwordSchema.index({ userId: 1, createdAt: -1 });
passwordSchema.index({ userId: 1, lastUsed: -1 });
passwordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Encryption methods
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key';
const ALGORITHM = 'aes-256-gcm';

passwordSchema.methods.encryptPassword = function(plainPassword) {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
    cipher.setAAD(Buffer.from(this.userId.toString()));
    
    let encrypted = cipher.update(plainPassword, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Store IV + authTag + encrypted data
    this.encryptedPassword = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    return this.encryptedPassword;
  } catch (error) {
    throw new Error('Failed to encrypt password');
  }
};

passwordSchema.methods.decryptPassword = function() {
  try {
    if (!this.encryptedPassword) {
      throw new Error('No encrypted password found');
    }
    
    const parts = this.encryptedPassword.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted password format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
    decipher.setAAD(Buffer.from(this.userId.toString()));
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt password');
  }
};

// Method to calculate password strength
passwordSchema.methods.calculatePasswordStrength = function(password) {
  let score = 0;
  let strength = 'weak';
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  // Pattern checks
  if (!/(.)\1{2,}/.test(password)) score += 1; // No repeated characters
  if (!/123|abc|qwe/i.test(password)) score += 1; // No common sequences
  
  // Determine strength
  if (score >= 8) strength = 'very-strong';
  else if (score >= 6) strength = 'strong';
  else if (score >= 4) strength = 'medium';
  else strength = 'weak';
  
  this.strength = strength;
  return strength;
};

// Method to update last used
passwordSchema.methods.updateLastUsed = function() {
  this.lastUsed = new Date();
  return this.save();
};

// Method to mark as compromised
passwordSchema.methods.markAsCompromised = function() {
  this.isCompromised = true;
  this.compromisedAt = new Date();
  return this.save();
};

// Method to share password with another user
passwordSchema.methods.shareWithUser = function(userId, permissions = 'view') {
  // Check if already shared with this user
  const existingShare = this.sharedWith.find(share => 
    share.userId.toString() === userId.toString()
  );
  
  if (existingShare) {
    existingShare.permissions = permissions;
    existingShare.sharedAt = new Date();
  } else {
    this.sharedWith.push({
      userId,
      permissions,
      sharedAt: new Date()
    });
  }
  
  return this.save();
};

// Method to unshare password
passwordSchema.methods.unshareWithUser = function(userId) {
  this.sharedWith = this.sharedWith.filter(share => 
    share.userId.toString() !== userId.toString()
  );
  return this.save();
};

// Static method to find passwords by category
passwordSchema.statics.findByCategory = function(userId, category) {
  return this.find({ userId, category }).sort({ createdAt: -1 });
};

// Static method to find favorite passwords
passwordSchema.statics.findFavorites = function(userId) {
  return this.find({ userId, isFavorite: true }).sort({ lastUsed: -1 });
};

// Static method to find expiring passwords
passwordSchema.statics.findExpiring = function(userId, days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    userId,
    expiresAt: { $lte: futureDate, $gte: new Date() }
  }).sort({ expiresAt: 1 });
};

// Static method to search passwords
passwordSchema.statics.searchPasswords = function(userId, searchTerm) {
  const regex = new RegExp(searchTerm, 'i');
  
  return this.find({
    userId,
    $or: [
      { title: regex },
      { website: regex },
      { username: regex },
      { email: regex },
      { notes: regex },
      { tags: { $in: [regex] } }
    ]
  }).sort({ createdAt: -1 });
};

const Password = mongoose.model('Password', passwordSchema);

export default Password;