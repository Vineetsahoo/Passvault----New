import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import upload from '../middleware/upload.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Apply authentication middleware to all user routes
router.use(authenticateToken);

// Validation middleware
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('profile.bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  body('profile.preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Theme must be light, dark, or auto'),
  
  body('securitySettings.sessionTimeout')
    .optional()
    .isInt({ min: 5, max: 1440 })
    .withMessage('Session timeout must be between 5 and 1440 minutes')
];

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          profile: user.profile,
          subscription: user.subscription,
          securitySettings: user.securitySettings,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile'
    });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', validateProfileUpdate, async (req, res) => {
  try {
    console.log('=== Profile Update Request ===');
    console.log('User ID:', req.user.userId);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Build updates object from request body
    const updateFields = {};
    Object.keys(req.body).forEach(key => {
      if (key !== 'email') { // Don't allow email updates
        updateFields[key] = req.body[key];
      }
    });

    console.log('Update fields:', updateFields);

    // Use MongoDB $set operator for safe nested updates
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create notification for profile update
    const updatedFieldsList = Object.keys(updateFields);
    
    // Only create notification if there are actual updates
    if (updatedFieldsList.length > 0) {
      // Ensure profile and notifications array exist
      if (!updatedUser.profile) {
        updatedUser.profile = {};
      }
      if (!updatedUser.profile.notifications) {
        updatedUser.profile.notifications = [];
      }
      
      updatedUser.profile.notifications.push({
        title: 'Profile Updated',
        message: `Your profile information has been updated successfully. ${updatedFieldsList.length} field(s) changed.`,
        type: 'success',
        category: 'profile',
        priority: 'low',
        action: {
          type: 'internal',
          label: 'View Profile',
          link: '/dashboard/user-profile'
        },
        metadata: {
          resourceType: 'profile',
          newValue: `Updated fields: ${updatedFieldsList.join(', ')}`
        }
      });

      console.log('About to save notification...');
      await updatedUser.save();
      console.log('Notification saved successfully!');
    }

    logger.info(`Profile updated for user: ${updatedUser.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          profile: updatedUser.profile,
          securitySettings: updatedUser.securitySettings,
          updatedAt: updatedUser.updatedAt
        }
      }
    });

  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @route   PUT /api/user/password
// @desc    Change user password
// @access  Private
router.put('/password', [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Check if new password is different from current
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Remove all refresh tokens to force re-login on all devices
    await user.removeAllRefreshTokens();

    logger.info(`Password changed for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password changed successfully. Please log in again.'
    });

  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// @route   DELETE /api/user/account
// @desc    Delete user account
// @access  Private
router.delete('/account', [
  body('password')
    .notEmpty()
    .withMessage('Password is required to delete account'),
  
  body('confirmDelete')
    .equals('DELETE')
    .withMessage('Please type DELETE to confirm account deletion')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { password } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // TODO: Delete all user passwords and related data
    // This should be implemented when you add the password management routes

    // Delete user account
    await User.findByIdAndDelete(req.user.userId);

    logger.info(`Account deleted for user: ${user.email}`);

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    logger.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
});

// @route   GET /api/user/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // TODO: Add password-related statistics when password management is implemented
    const stats = {
      accountAge: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)), // days
      lastLogin: user.lastLogin,
      isEmailVerified: user.isEmailVerified,
      subscription: user.subscription,
      passwordCount: 0, // TODO: Implement when passwords are added
      favoriteCount: 0, // TODO: Implement when passwords are added
      sharedCount: 0, // TODO: Implement when passwords are added
      weakPasswordCount: 0, // TODO: Implement when passwords are added
      compromisedPasswordCount: 0 // TODO: Implement when passwords are added
    };

    res.json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: { stats }
    });

  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user statistics'
    });
  }
});

// @route   POST /api/user/sessions/revoke
// @desc    Revoke all active sessions except current
// @access  Private
router.post('/sessions/revoke', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get current refresh token from cookies
    const currentRefreshToken = req.cookies.refreshToken;
    
    // Remove all refresh tokens except the current one
    if (currentRefreshToken) {
      user.refreshTokens = user.refreshTokens.filter(rt => rt.token === currentRefreshToken);
    } else {
      user.refreshTokens = [];
    }
    
    await user.save();

    logger.info(`All sessions revoked for user: ${user.email}`);

    res.json({
      success: true,
      message: 'All other sessions have been revoked successfully'
    });

  } catch (error) {
    logger.error('Revoke sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke sessions'
    });
  }
});

// @route   POST /api/user/documents/upload
// @desc    Upload a document (identity or financial)
// @access  Private
router.post('/documents/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { documentType, category, type, number, expiryDate, status, institution, lastUpdated } = req.body;

    if (!documentType || !category) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Document type and category are required'
      });
    }

    if (!['identity', 'financial'].includes(category)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Category must be either "identity" or "financial"'
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prepare document object
    const documentData = {
      type: documentType,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date()
    };

    // Add category-specific fields
    if (category === 'identity') {
      documentData.number = number || '';
      documentData.expiryDate = expiryDate || '';
      documentData.status = status || 'active';
      user.profile.documents.identity.push(documentData);
    } else if (category === 'financial') {
      documentData.institution = institution || '';
      documentData.lastUpdated = lastUpdated || new Date().toLocaleDateString();
      user.profile.documents.financial.push(documentData);
    }

    // Create notification for document upload
    user.profile.notifications.push({
      title: 'Document Uploaded',
      message: `Your ${documentType} document has been uploaded successfully to the ${category} category.`,
      type: 'success',
      category: 'document',
      priority: 'low',
      isRead: false,
      action: {
        type: 'view',
        label: 'View Documents',
        link: '/dashboard/user-profile?tab=documents'
      },
      metadata: {
        resourceType: 'document',
        resourceId: documentData.fileName,
        newValue: `${category}/${documentType}`
      },
      createdAt: new Date()
    });
    
    await user.save();

    logger.info(`Document uploaded for user: ${user.email}, category: ${category}`);

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        document: documentData
      }
    });

  } catch (error) {
    // Clean up uploaded file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    logger.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload document'
    });
  }
});

// @route   GET /api/user/documents/:category/:documentId
// @desc    Download a specific document
// @access  Private
router.get('/documents/:category/:documentId', async (req, res) => {
  try {
    const { category, documentId } = req.params;

    if (!['identity', 'financial'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the document
    const document = user.profile.documents[category].id(documentId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if file exists
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Send file
    res.download(document.filePath, document.fileName);

  } catch (error) {
    logger.error('Download document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document'
    });
  }
});

// @route   DELETE /api/user/documents/:category/:documentId
// @desc    Delete a specific document
// @access  Private
router.delete('/documents/:category/:documentId', async (req, res) => {
  try {
    const { category, documentId } = req.params;

    if (!['identity', 'financial'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find and remove the document
    const document = user.profile.documents[category].id(documentId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Store document info before deletion for notification
    const documentInfo = {
      name: document.fileName,
      type: document.documentType,
      category: category
    };

    // Remove document from database
    user.profile.documents[category].pull(documentId);

    // Create notification for document deletion
    user.profile.notifications.push({
      title: 'Document Deleted',
      message: `"${documentInfo.name}" has been removed from your ${documentInfo.category} documents.`,
      type: 'alert',
      category: 'document',
      priority: 'medium',
      action: {
        type: 'internal',
        label: 'View Documents',
        link: '/dashboard/user-profile?tab=documents'
      },
      metadata: {
        resourceType: 'document',
        resourceId: documentId,
        oldValue: `${documentInfo.type} - ${documentInfo.name}`
      }
    });

    await user.save();

    logger.info(`Document deleted for user: ${user.email}, category: ${category}, id: ${documentId}`);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    logger.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document'
    });
  }
});

// @route   GET /api/user/documents
// @desc    Get all user documents
// @access  Private
router.get('/documents', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return documents without file paths for security
    const documents = {
      identity: user.profile.documents.identity.map(doc => ({
        id: doc._id,
        type: doc.type,
        number: doc.number,
        expiryDate: doc.expiryDate,
        status: doc.status,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        uploadedAt: doc.uploadedAt
      })),
      financial: user.profile.documents.financial.map(doc => ({
        id: doc._id,
        type: doc.type,
        institution: doc.institution,
        lastUpdated: doc.lastUpdated,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        uploadedAt: doc.uploadedAt
      }))
    };

    res.json({
      success: true,
      message: 'Documents retrieved successfully',
      data: { documents }
    });

  } catch (error) {
    logger.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve documents'
    });
  }
});

// @route   GET /api/user/billing
// @desc    Get user billing information
// @access  Private
router.get('/billing', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const billing = {
      paymentMethods: user.profile.billing.paymentMethods.map(method => ({
        id: method._id,
        type: method.type,
        provider: method.provider,
        lastFour: method.lastFour,
        expiryDate: method.expiryDate,
        isDefault: method.isDefault,
        cardHolderName: method.cardHolderName,
        addedAt: method.addedAt
      })),
      invoices: user.profile.billing.invoices.map(invoice => ({
        id: invoice._id,
        invoiceId: invoice.invoiceId,
        date: invoice.date,
        amount: invoice.amount,
        status: invoice.status,
        description: invoice.description,
        downloadUrl: invoice.downloadUrl
      })),
      subscriptionHistory: user.profile.billing.subscriptionHistory.map(sub => ({
        id: sub._id,
        plan: sub.plan,
        startDate: sub.startDate,
        endDate: sub.endDate,
        amount: sub.amount,
        status: sub.status
      }))
    };

    res.json({
      success: true,
      message: 'Billing information retrieved successfully',
      data: { billing }
    });

  } catch (error) {
    logger.error('Get billing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve billing information'
    });
  }
});

// @route   POST /api/user/billing/payment-method
// @desc    Add a new payment method
// @access  Private
router.post('/billing/payment-method', [
  body('type').isIn(['credit', 'debit']).withMessage('Type must be credit or debit'),
  body('provider').notEmpty().withMessage('Provider is required'),
  body('lastFour').isLength({ min: 4, max: 4 }).withMessage('Last four digits required'),
  body('expiryDate').notEmpty().withMessage('Expiry date is required'),
  body('cardHolderName').notEmpty().withMessage('Card holder name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { type, provider, lastFour, expiryDate, cardHolderName, isDefault } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If this is set as default, unset all other defaults
    if (isDefault) {
      user.profile.billing.paymentMethods.forEach(method => {
        method.isDefault = false;
      });
    }

    user.profile.billing.paymentMethods.push({
      type,
      provider,
      lastFour,
      expiryDate,
      cardHolderName,
      isDefault: isDefault || false,
      addedAt: new Date()
    });

    // Create notification for payment method added
    user.profile.notifications.push({
      title: 'Payment Method Added',
      message: `A new ${type} card ending in ${lastFour} has been added to your account.`,
      type: 'success',
      category: 'billing',
      priority: 'low',
      isRead: false,
      action: {
        type: 'view',
        label: 'View Payment Methods',
        link: '/dashboard/user-profile?tab=billing'
      },
      metadata: {
        resourceType: 'payment_method',
        resourceId: lastFour,
        newValue: `${provider} ${type}`
      },
      createdAt: new Date()
    });

    await user.save();

    logger.info(`Payment method added for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Payment method added successfully'
    });

  } catch (error) {
    logger.error('Add payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add payment method'
    });
  }
});

// @route   DELETE /api/user/billing/payment-method/:methodId
// @desc    Delete a payment method
// @access  Private
router.delete('/billing/payment-method/:methodId', async (req, res) => {
  try {
    const { methodId } = req.params;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const method = user.profile.billing.paymentMethods.id(methodId);
    if (!method) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    const methodInfo = `${method.provider} ${method.type} ending in ${method.lastFour}`;
    
    user.profile.billing.paymentMethods.pull(methodId);
    
    // Create notification for payment method removed
    user.profile.notifications.push({
      title: 'Payment Method Removed',
      message: `${methodInfo} has been removed from your account.`,
      type: 'info',
      category: 'billing',
      priority: 'low',
      isRead: false,
      action: {
        type: 'view',
        label: 'View Payment Methods',
        link: '/dashboard/user-profile?tab=billing'
      },
      metadata: {
        resourceType: 'payment_method',
        resourceId: method.lastFour,
        oldValue: methodInfo
      },
      createdAt: new Date()
    });
    
    await user.save();

    logger.info(`Payment method deleted for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Payment method deleted successfully'
    });

  } catch (error) {
    logger.error('Delete payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment method'
    });
  }
});

// @route   GET /api/user/security
// @desc    Get user security information
// @access  Private
router.get('/security', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const security = {
      lastPasswordChange: user.profile.security.lastPasswordChange,
      securityQuestions: user.profile.security.securityQuestions,
      backupCodes: user.profile.security.backupCodes,
      recoveryEmail: user.profile.security.recoveryEmail,
      activeDevices: user.profile.totalDevices || 0,
      loginHistory: user.profile.security.loginHistory.slice(0, 10).map(login => ({
        id: login._id,
        device: login.device,
        browser: login.browser,
        location: login.location,
        timestamp: login.timestamp,
        status: login.status
      }))
    };

    res.json({
      success: true,
      message: 'Security information retrieved successfully',
      data: { security }
    });

  } catch (error) {
    logger.error('Get security error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve security information'
    });
  }
});

// @route   PUT /api/user/security/recovery-email
// @desc    Update recovery email
// @access  Private
router.put('/security/recovery-email', [
  body('recoveryEmail').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { recoveryEmail } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const oldEmail = user.profile.security.recoveryEmail;
    user.profile.security.recoveryEmail = recoveryEmail;
    
    // Create notification for recovery email update
    user.profile.notifications.push({
      title: 'Recovery Email Updated',
      message: `Your recovery email has been updated to ${recoveryEmail}.`,
      type: 'security',
      category: 'security',
      priority: 'medium',
      isRead: false,
      action: {
        type: 'review',
        label: 'Review Security Settings',
        link: '/dashboard/user-profile?tab=security'
      },
      metadata: {
        resourceType: 'recovery_email',
        oldValue: oldEmail,
        newValue: recoveryEmail
      },
      createdAt: new Date()
    });
    
    await user.save();

    logger.info(`Recovery email updated for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Recovery email updated successfully'
    });

  } catch (error) {
    logger.error('Update recovery email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update recovery email'
    });
  }
});

// @route   POST /api/user/security/generate-backup-codes
// @desc    Generate new backup codes
// @access  Private
router.post('/security/generate-backup-codes', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate 10 backup codes
    user.profile.security.backupCodes = 10;

    // Create notification for backup codes generation
    user.profile.notifications.push({
      title: 'Backup Codes Generated',
      message: 'New backup codes have been generated for your account. Keep them safe!',
      type: 'security',
      category: 'security',
      priority: 'high',
      action: {
        type: 'internal',
        label: 'View Security Settings',
        link: '/dashboard/user-profile?tab=security'
      },
      metadata: {
        resourceType: 'backup_codes',
        newValue: '10 codes generated'
      }
    });

    await user.save();

    logger.info(`Backup codes generated for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Backup codes generated successfully',
      data: {
        backupCodes: 10
      }
    });

  } catch (error) {
    logger.error('Generate backup codes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate backup codes'
    });
  }
});

// ==================== NOTIFICATIONS ENDPOINTS ====================

// @route   GET /api/user/notifications
// @desc    Get all user notifications
// @access  Private
router.get('/notifications', async (req, res) => {
  try {
    const { filter, sortBy, limit = 50 } = req.query;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let notifications = user.profile.notifications || [];

    // Filter by category
    if (filter && filter !== 'all') {
      notifications = notifications.filter(n => n.category === filter);
    }

    // Sort notifications
    if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      notifications.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else {
      // Sort by newest (default)
      notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Limit results
    notifications = notifications.slice(0, parseInt(limit));

    res.json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: {
        notifications: notifications.map(n => ({
          id: n._id,
          title: n.title,
          message: n.message,
          type: n.type,
          category: n.category,
          priority: n.priority,
          isRead: n.isRead,
          action: n.action,
          timestamp: n.createdAt,
          readAt: n.readAt
        })),
        unreadCount: notifications.filter(n => !n.isRead).length,
        totalCount: (user.profile.notifications || []).length
      }
    });

  } catch (error) {
    logger.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications'
    });
  }
});

// @route   POST /api/user/notifications
// @desc    Create a new notification (internal use - can be called from other routes)
// @access  Private
router.post('/notifications', async (req, res) => {
  try {
    const { title, message, type, category, priority, action, metadata } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create notification
    const notification = {
      title,
      message,
      type: type || 'info',
      category: category || 'system',
      priority: priority || 'medium',
      isRead: false,
      action: action || {},
      metadata: metadata || {},
      createdAt: new Date()
    };

    user.profile.notifications.push(notification);
    
    // Keep only last 100 notifications
    if (user.profile.notifications.length > 100) {
      user.profile.notifications = user.profile.notifications.slice(-100);
    }

    await user.save();

    logger.info(`Notification created for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Notification created successfully',
      data: { notification }
    });

  } catch (error) {
    logger.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification'
    });
  }
});

// @route   PUT /api/user/notifications/:notificationId/read
// @desc    Mark notification as read
// @access  Private
router.put('/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const notification = user.profile.notifications.id(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await user.save();

    logger.info(`Notification marked as read for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    logger.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// @route   PUT /api/user/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put('/notifications/mark-all-read', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const now = new Date();
    user.profile.notifications.forEach(notification => {
      if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt = now;
      }
    });

    await user.save();

    logger.info(`All notifications marked as read for user: ${user.email}`);

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    logger.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

// @route   DELETE /api/user/notifications/:notificationId
// @desc    Delete a notification
// @access  Private
router.delete('/notifications/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.profile.notifications.pull(notificationId);
    await user.save();

    logger.info(`Notification deleted for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    logger.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

// @route   DELETE /api/user/notifications
// @desc    Clear all notifications
// @access  Private
router.delete('/notifications', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.profile.notifications = [];
    await user.save();

    logger.info(`All notifications cleared for user: ${user.email}`);

    res.json({
      success: true,
      message: 'All notifications cleared successfully'
    });

  } catch (error) {
    logger.error('Clear notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear notifications'
    });
  }
});

// Helper function to create notification (can be called from other routes)
export const createNotification = async (userId, notificationData) => {
  try {
    const user = await User.findById(userId);
    if (!user) return false;

    const notification = {
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'info',
      category: notificationData.category || 'system',
      priority: notificationData.priority || 'medium',
      isRead: false,
      action: notificationData.action || {},
      metadata: notificationData.metadata || {},
      createdAt: new Date()
    };

    user.profile.notifications.push(notification);
    
    // Keep only last 100 notifications
    if (user.profile.notifications.length > 100) {
      user.profile.notifications = user.profile.notifications.slice(-100);
    }

    await user.save();
    logger.info(`Notification created for user: ${user.email}`);
    return true;
  } catch (error) {
    logger.error('Create notification helper error:', error);
    return false;
  }
};

export default router;