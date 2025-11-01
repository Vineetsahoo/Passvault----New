import { body, param, query, validationResult } from 'express-validator';

/**
 * Centralized validation utility for all API endpoints
 * Provides consistent validation rules across the application
 */

// ==================== HELPER FUNCTIONS ====================

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

/**
 * Custom validator for strong passwords
 */
export const isStrongPassword = (value) => {
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!strongPasswordRegex.test(value)) {
    throw new Error('Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character');
  }
  return true;
};

/**
 * Custom validator for MongoDB ObjectId
 */
export const isValidObjectId = (value) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(value)) {
    throw new Error('Invalid ID format');
  }
  return true;
};

/**
 * Custom validator for phone numbers
 */
export const isValidPhoneNumber = (value) => {
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  if (!phoneRegex.test(value)) {
    throw new Error('Invalid phone number format');
  }
  return true;
};

/**
 * Custom validator for URLs
 */
export const isValidURL = (value) => {
  try {
    new URL(value);
    return true;
  } catch (error) {
    throw new Error('Invalid URL format');
  }
};

// ==================== AUTH VALIDATIONS ====================

export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .custom(isStrongPassword),
  
  body('confirmPassword')
    .notEmpty().withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  body('rememberMe')
    .optional()
    .isBoolean().withMessage('Remember me must be a boolean'),
  
  handleValidationErrors
];

export const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .custom(isStrongPassword),
  
  body('confirmPassword')
    .notEmpty().withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
  
  handleValidationErrors
];

export const validateResetPassword = [
  body('token')
    .notEmpty().withMessage('Reset token is required'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .custom(isStrongPassword),
  
  body('confirmPassword')
    .notEmpty().withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
  
  handleValidationErrors
];

// ==================== PASSWORD VALIDATIONS ====================

export const validateCreatePassword = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
  
  body('username')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Username must not exceed 100 characters'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ max: 500 }).withMessage('Password must not exceed 500 characters'),
  
  body('website')
    .optional()
    .trim()
    .isURL().withMessage('Please provide a valid URL'),
  
  body('category')
    .optional()
    .trim()
    .isIn(['social', 'banking', 'email', 'shopping', 'work', 'entertainment', 'other'])
    .withMessage('Invalid category'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
  
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  
  body('isFavorite')
    .optional()
    .isBoolean().withMessage('isFavorite must be a boolean'),
  
  handleValidationErrors
];

export const validateUpdatePassword = [
  param('id')
    .notEmpty().withMessage('Password ID is required')
    .custom(isValidObjectId),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
  
  body('username')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Username must not exceed 100 characters'),
  
  body('password')
    .optional()
    .isLength({ max: 500 }).withMessage('Password must not exceed 500 characters'),
  
  body('website')
    .optional()
    .trim()
    .isURL().withMessage('Please provide a valid URL'),
  
  body('category')
    .optional()
    .trim()
    .isIn(['social', 'banking', 'email', 'shopping', 'work', 'entertainment', 'other'])
    .withMessage('Invalid category'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
  
  body('isFavorite')
    .optional()
    .isBoolean().withMessage('isFavorite must be a boolean'),
  
  handleValidationErrors
];

export const validatePasswordQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search query must not exceed 100 characters'),
  
  query('category')
    .optional()
    .trim()
    .isIn(['all', 'social', 'banking', 'email', 'shopping', 'work', 'entertainment', 'other'])
    .withMessage('Invalid category'),
  
  query('sortBy')
    .optional()
    .trim()
    .isIn(['title', '-title', 'createdAt', '-createdAt', 'updatedAt', '-updatedAt'])
    .withMessage('Invalid sort field'),
  
  handleValidationErrors
];

// ==================== DOCUMENT VALIDATIONS ====================

export const validateUploadDocument = [
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['document', 'image', 'video', 'audio', 'other'])
    .withMessage('Invalid category'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  
  handleValidationErrors
];

export const validateDocumentQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('category')
    .optional()
    .isIn(['all', 'document', 'image', 'video', 'audio', 'other'])
    .withMessage('Invalid category'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search query must not exceed 100 characters'),
  
  handleValidationErrors
];

// ==================== QR CODE VALIDATIONS ====================

export const validateCreateQRCode = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
  
  body('data')
    .notEmpty().withMessage('Data is required')
    .isLength({ max: 5000 }).withMessage('Data must not exceed 5000 characters'),
  
  body('type')
    .notEmpty().withMessage('Type is required')
    .isIn(['url', 'text', 'email', 'phone', 'sms', 'wifi', 'vcard', 'location'])
    .withMessage('Invalid QR code type'),
  
  body('category')
    .optional()
    .isIn(['personal', 'business', 'event', 'product', 'other'])
    .withMessage('Invalid category'),
  
  body('expiresAt')
    .optional()
    .isISO8601().withMessage('Invalid expiration date format'),
  
  body('isFavorite')
    .optional()
    .isBoolean().withMessage('isFavorite must be a boolean'),
  
  handleValidationErrors
];

export const validateUpdateQRCode = [
  param('id')
    .notEmpty().withMessage('QR code ID is required')
    .custom(isValidObjectId),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
  
  body('data')
    .optional()
    .isLength({ max: 5000 }).withMessage('Data must not exceed 5000 characters'),
  
  body('category')
    .optional()
    .isIn(['personal', 'business', 'event', 'product', 'other'])
    .withMessage('Invalid category'),
  
  body('expiresAt')
    .optional()
    .isISO8601().withMessage('Invalid expiration date format'),
  
  body('isFavorite')
    .optional()
    .isBoolean().withMessage('isFavorite must be a boolean'),
  
  handleValidationErrors
];

// ==================== BACKUP VALIDATIONS ====================

export const validateCreateBackup = [
  body('type')
    .notEmpty().withMessage('Backup type is required')
    .isIn(['full', 'selective', 'device-specific'])
    .withMessage('Invalid backup type'),
  
  body('encryption')
    .notEmpty().withMessage('Encryption is required')
    .isIn(['AES-256', 'AES-128'])
    .withMessage('Invalid encryption type'),
  
  body('includePasswords')
    .optional()
    .isBoolean().withMessage('includePasswords must be a boolean'),
  
  body('includeDocuments')
    .optional()
    .isBoolean().withMessage('includeDocuments must be a boolean'),
  
  body('includeQRCodes')
    .optional()
    .isBoolean().withMessage('includeQRCodes must be a boolean'),
  
  body('selectedItems')
    .optional()
    .isObject().withMessage('selectedItems must be an object'),
  
  body('selectedItems.passwords')
    .optional()
    .isArray().withMessage('selectedItems.passwords must be an array'),
  
  body('selectedItems.documents')
    .optional()
    .isArray().withMessage('selectedItems.documents must be an array'),
  
  body('selectedItems.qrcodes')
    .optional()
    .isArray().withMessage('selectedItems.qrcodes must be an array'),
  
  body('deviceId')
    .optional()
    .custom(isValidObjectId),
  
  handleValidationErrors
];

export const validateRestoreBackup = [
  param('id')
    .notEmpty().withMessage('Backup ID is required')
    .custom(isValidObjectId),
  
  body('overwriteExisting')
    .optional()
    .isBoolean().withMessage('overwriteExisting must be a boolean'),
  
  handleValidationErrors
];

// ==================== DEVICE VALIDATIONS ====================

export const validateRegisterDevice = [
  body('deviceName')
    .trim()
    .notEmpty().withMessage('Device name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Device name must be between 1 and 100 characters'),
  
  body('deviceType')
    .notEmpty().withMessage('Device type is required')
    .isIn(['desktop', 'mobile', 'tablet', 'web'])
    .withMessage('Invalid device type'),
  
  body('os')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('OS must not exceed 50 characters'),
  
  body('browser')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Browser must not exceed 50 characters'),
  
  handleValidationErrors
];

export const validateUpdateDevice = [
  param('id')
    .notEmpty().withMessage('Device ID is required')
    .custom(isValidObjectId),
  
  body('deviceName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Device name must be between 1 and 100 characters'),
  
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
  
  handleValidationErrors
];

// ==================== USER PROFILE VALIDATIONS ====================

export const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
  
  body('profile.bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio must not exceed 500 characters'),
  
  body('profile.avatar')
    .optional()
    .trim()
    .isURL().withMessage('Avatar must be a valid URL'),
  
  body('profile.phoneNumber')
    .optional()
    .trim()
    .custom(isValidPhoneNumber),
  
  body('profile.dateOfBirth')
    .optional()
    .isISO8601().withMessage('Invalid date format'),
  
  body('profile.preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'auto']).withMessage('Theme must be light, dark, or auto'),
  
  body('profile.preferences.language')
    .optional()
    .isIn(['en', 'es', 'fr', 'de', 'hi', 'zh']).withMessage('Invalid language'),
  
  handleValidationErrors
];

export const validateDocumentUpload = [
  body('documentType')
    .trim()
    .notEmpty().withMessage('Document type is required')
    .isLength({ max: 50 }).withMessage('Document type must not exceed 50 characters'),
  
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['identity', 'financial']).withMessage('Category must be identity or financial'),
  
  body('number')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Document number must not exceed 100 characters'),
  
  body('expiryDate')
    .optional()
    .trim(),
  
  body('institution')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Institution must not exceed 100 characters'),
  
  handleValidationErrors
];

export const validatePaymentMethod = [
  body('type')
    .notEmpty().withMessage('Payment type is required')
    .isIn(['credit', 'debit']).withMessage('Type must be credit or debit'),
  
  body('provider')
    .trim()
    .notEmpty().withMessage('Provider is required')
    .isIn(['visa', 'mastercard', 'amex', 'discover']).withMessage('Invalid provider'),
  
  body('lastFour')
    .trim()
    .notEmpty().withMessage('Last four digits are required')
    .isLength({ min: 4, max: 4 }).withMessage('Last four must be exactly 4 digits')
    .isNumeric().withMessage('Last four must contain only numbers'),
  
  body('expiryDate')
    .trim()
    .notEmpty().withMessage('Expiry date is required')
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/).withMessage('Expiry date must be in MM/YY format'),
  
  body('cardHolderName')
    .trim()
    .notEmpty().withMessage('Card holder name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Card holder name must be between 2 and 100 characters'),
  
  body('isDefault')
    .optional()
    .isBoolean().withMessage('isDefault must be a boolean'),
  
  handleValidationErrors
];

// ==================== NOTIFICATION VALIDATIONS ====================

export const validateCreateNotification = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
  
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 1, max: 500 }).withMessage('Message must be between 1 and 500 characters'),
  
  body('type')
    .optional()
    .isIn(['info', 'success', 'warning', 'error', 'security']).withMessage('Invalid notification type'),
  
  body('category')
    .optional()
    .isIn(['system', 'security', 'backup', 'password', 'document', 'billing', 'profile'])
    .withMessage('Invalid category'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  
  handleValidationErrors
];

// ==================== ALERT VALIDATIONS ====================

export const validateCreateAlert = [
  body('type')
    .notEmpty().withMessage('Alert type is required')
    .isIn(['breach', 'weak_password', 'password_expiry', 'login_attempt', 'device_added'])
    .withMessage('Invalid alert type'),
  
  body('severity')
    .notEmpty().withMessage('Severity is required')
    .isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity'),
  
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title must not exceed 100 characters'),
  
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ max: 500 }).withMessage('Message must not exceed 500 characters'),
  
  handleValidationErrors
];

// ==================== SETTINGS VALIDATIONS ====================

export const validateSecuritySettings = [
  body('twoFactorEnabled')
    .optional()
    .isBoolean().withMessage('twoFactorEnabled must be a boolean'),
  
  body('sessionTimeout')
    .optional()
    .isInt({ min: 5, max: 1440 }).withMessage('Session timeout must be between 5 and 1440 minutes'),
  
  body('passwordExpiryDays')
    .optional()
    .isInt({ min: 30, max: 365 }).withMessage('Password expiry must be between 30 and 365 days'),
  
  body('loginNotifications')
    .optional()
    .isBoolean().withMessage('loginNotifications must be a boolean'),
  
  handleValidationErrors
];

export const validateBackupSettings = [
  body('autoBackupEnabled')
    .optional()
    .isBoolean().withMessage('autoBackupEnabled must be a boolean'),
  
  body('backupFrequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid backup frequency'),
  
  body('backupRetention')
    .optional()
    .isInt({ min: 1, max: 90 }).withMessage('Backup retention must be between 1 and 90 days'),
  
  body('cloudBackupEnabled')
    .optional()
    .isBoolean().withMessage('cloudBackupEnabled must be a boolean'),
  
  body('cloudProvider')
    .optional()
    .isIn(['google', 'dropbox', 'onedrive', 'local']).withMessage('Invalid cloud provider'),
  
  handleValidationErrors
];

// ==================== TRANSACTION VALIDATIONS ====================

export const validateTransaction = [
  body('type')
    .notEmpty().withMessage('Transaction type is required')
    .isIn(['payment', 'subscription', 'refund', 'upgrade', 'downgrade'])
    .withMessage('Invalid transaction type'),
  
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  
  body('currency')
    .notEmpty().withMessage('Currency is required')
    .isIn(['USD', 'EUR', 'GBP', 'INR']).withMessage('Invalid currency'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Description must not exceed 200 characters'),
  
  handleValidationErrors
];

// ==================== HISTORY VALIDATIONS ====================

export const validateHistoryQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('type')
    .optional()
    .isIn(['all', 'password', 'document', 'qrcode', 'backup', 'login', 'settings'])
    .withMessage('Invalid history type'),
  
  query('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date format'),
  
  query('endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date format'),
  
  handleValidationErrors
];

// ==================== MONITORING VALIDATIONS ====================

export const validateMonitoringQuery = [
  query('period')
    .optional()
    .isIn(['today', 'week', 'month', 'year']).withMessage('Invalid period'),
  
  query('metric')
    .optional()
    .isIn(['all', 'passwords', 'documents', 'qrcodes', 'backups', 'logins'])
    .withMessage('Invalid metric'),
  
  handleValidationErrors
];

// ==================== ID PARAM VALIDATION ====================

export const validateObjectIdParam = (paramName = 'id') => [
  param(paramName)
    .notEmpty().withMessage(`${paramName} is required`)
    .custom(isValidObjectId),
  
  handleValidationErrors
];

// ==================== PAGINATION VALIDATION ====================

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  handleValidationErrors
];

export default {
  handleValidationErrors,
  isStrongPassword,
  isValidObjectId,
  isValidPhoneNumber,
  isValidURL,
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateResetPassword,
  validateCreatePassword,
  validateUpdatePassword,
  validatePasswordQuery,
  validateUploadDocument,
  validateDocumentQuery,
  validateCreateQRCode,
  validateUpdateQRCode,
  validateCreateBackup,
  validateRestoreBackup,
  validateRegisterDevice,
  validateUpdateDevice,
  validateProfileUpdate,
  validateDocumentUpload,
  validatePaymentMethod,
  validateCreateNotification,
  validateCreateAlert,
  validateSecuritySettings,
  validateBackupSettings,
  validateTransaction,
  validateHistoryQuery,
  validateMonitoringQuery,
  validateObjectIdParam,
  validatePagination
};
