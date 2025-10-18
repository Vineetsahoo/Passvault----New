import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    default: null
  },
  refreshTokens: [{
    token: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '7d' // Automatically delete after 7 days
    }
  }],
  profile: {
    avatar: {
      type: String,
      default: 'https://via.placeholder.com/150'
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: ''
    },
    role: {
      type: String,
      default: 'Free User'
    },
    memberSince: {
      type: String,
      default: function() {
        return new Date(this.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
    },
    securityScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    totalDevices: {
      type: Number,
      default: 0
    },
    personalInfo: {
      dateOfBirth: { type: String, default: '' },
      phoneNumber: { type: String, default: '' },
      nationality: { type: String, default: '' },
      maritalStatus: { type: String, default: '' },
      gender: { type: String, default: '' }
    },
    professionalInfo: {
      occupation: { type: String, default: '' },
      company: { type: String, default: '' },
      department: { type: String, default: '' },
      employeeId: { type: String, default: '' },
      experience: { type: String, default: '' },
      education: [{
        degree: { type: String },
        institution: { type: String },
        year: { type: String }
      }]
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: '' },
      postalCode: { type: String, default: '' }
    },
    socialProfiles: {
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      twitter: { type: String, default: '' },
      website: { type: String, default: '' }
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'auto'
      },
      notifications: {
        email: {
          type: Boolean,
          default: true
        },
        security: {
          type: Boolean,
          default: true
        }
      },
      language: {
        type: String,
        default: 'en'
      }
    },
    documents: {
      identity: [{
        type: { type: String, default: '' },
        number: { type: String, default: '' },
        expiryDate: { type: String, default: '' },
        status: { type: String, enum: ['active', 'expired'], default: 'active' },
        fileName: { type: String },
        filePath: { type: String },
        fileSize: { type: Number },
        mimeType: { type: String },
        uploadedAt: { type: Date, default: Date.now }
      }],
      financial: [{
        type: { type: String, default: '' },
        institution: { type: String, default: '' },
        lastUpdated: { type: String, default: '' },
        fileName: { type: String },
        filePath: { type: String },
        fileSize: { type: Number },
        mimeType: { type: String },
        uploadedAt: { type: Date, default: Date.now }
      }]
    },
    billing: {
      paymentMethods: [{
        type: { type: String, enum: ['credit', 'debit'], default: 'credit' },
        provider: { type: String, default: '' }, // visa, mastercard, etc.
        lastFour: { type: String, default: '' },
        expiryDate: { type: String, default: '' },
        isDefault: { type: Boolean, default: false },
        cardHolderName: { type: String, default: '' },
        addedAt: { type: Date, default: Date.now }
      }],
      invoices: [{
        invoiceId: { type: String, default: '' },
        date: { type: Date, default: Date.now },
        amount: { type: Number, default: 0 },
        status: { type: String, enum: ['paid', 'pending', 'failed'], default: 'pending' },
        description: { type: String, default: '' },
        downloadUrl: { type: String, default: '' }
      }],
      subscriptionHistory: [{
        plan: { type: String, default: '' },
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date },
        amount: { type: Number, default: 0 },
        status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' }
      }]
    },
    security: {
      lastPasswordChange: { type: Date, default: Date.now },
      securityQuestions: { type: Number, default: 0 },
      backupCodes: { type: Number, default: 0 },
      recoveryEmail: { type: String, default: '' },
      loginHistory: [{
        device: { type: String, default: '' },
        browser: { type: String, default: '' },
        location: { type: String, default: '' },
        ipAddress: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
        status: { type: String, enum: ['success', 'failed'], default: 'success' }
      }]
    },
    notifications: [{
      title: { type: String, required: true },
      message: { type: String, required: true },
      type: { 
        type: String, 
        enum: ['success', 'warning', 'alert', 'security', 'sync', 'info'], 
        default: 'info' 
      },
      category: { 
        type: String, 
        enum: ['password', 'security', 'sync', 'system', 'billing', 'profile', 'document'], 
        default: 'system' 
      },
      priority: { 
        type: String, 
        enum: ['high', 'medium', 'low'], 
        default: 'medium' 
      },
      isRead: { type: Boolean, default: false },
      action: {
        type: { 
          type: String, 
          enum: ['internal', 'external', 'review', 'change', 'backup', 'verify', 'update', 'view'], 
          default: null 
        },
        label: { type: String, default: '' },
        link: { type: String, default: '' }
      },
      metadata: {
        resourceType: { type: String, default: '' }, // e.g., 'payment_method', 'document', 'password'
        resourceId: { type: String, default: '' },
        oldValue: { type: String, default: '' },
        newValue: { type: String, default: '' }
      },
      createdAt: { type: Date, default: Date.now },
      readAt: { type: Date, default: null }
    }]
  },
  securitySettings: {
    sessionTimeout: {
      type: Number,
      default: 30, // minutes
      min: [5, 'Session timeout must be at least 5 minutes'],
      max: [1440, 'Session timeout cannot exceed 24 hours']
    },
    autoLock: {
      type: Boolean,
      default: true
    },
    passwordStrengthRequired: {
      type: String,
      enum: ['weak', 'medium', 'strong'],
      default: 'medium'
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium', 'enterprise'],
      default: 'free'
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.emailVerificationToken;
      delete ret.emailVerificationExpires;
      delete ret.twoFactorSecret;
      delete ret.refreshTokens;
      return ret;
    }
  }
});

// Indexes for better query performance
userSchema.index({ passwordResetToken: 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with salt rounds from environment or default to 12
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!candidatePassword || !this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to handle failed login attempts
userSchema.methods.incLoginAttempts = function() {
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // If we're at max attempts and it's not locked yet, lock the account
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  return this.updateOne({ lastLogin: new Date() });
};

// Method to add refresh token
userSchema.methods.addRefreshToken = function(token) {
  this.refreshTokens.push({ token });
  return this.save();
};

// Method to remove refresh token
userSchema.methods.removeRefreshToken = function(token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
  return this.save();
};

// Method to remove all refresh tokens (useful for logout all devices)
userSchema.methods.removeAllRefreshTokens = function() {
  this.refreshTokens = [];
  return this.save();
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ 'subscription.isActive': true });
};

const User = mongoose.model('User', userSchema);

export default User;