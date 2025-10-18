import { logger } from '../utils/logger.js';

// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error Handler:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid resource ID format';
    error = {
      message,
      statusCode: 400,
      code: 'INVALID_ID'
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    let message = 'Duplicate field value entered';
    let field = 'field';
    
    // Extract field name from error
    if (err.keyPattern) {
      field = Object.keys(err.keyPattern)[0];
      message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    }
    
    error = {
      message,
      statusCode: 409,
      code: 'DUPLICATE_ENTRY',
      field
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error = {
      message: 'Validation failed',
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      errors: messages
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      statusCode: 401,
      code: 'INVALID_TOKEN'
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      statusCode: 401,
      code: 'TOKEN_EXPIRED'
    };
  }

  // Rate limiting errors
  if (err.type === 'rate-limit') {
    error = {
      message: 'Too many requests, please try again later',
      statusCode: 429,
      code: 'RATE_LIMITED',
      retryAfter: err.retryAfter || 900
    };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      message: 'File too large',
      statusCode: 413,
      code: 'FILE_TOO_LARGE'
    };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error = {
      message: 'Too many files',
      statusCode: 413,
      code: 'TOO_MANY_FILES'
    };
  }

  // Database connection errors
  if (err.name === 'MongooseError' || err.name === 'MongoError') {
    error = {
      message: 'Database connection error',
      statusCode: 503,
      code: 'DATABASE_ERROR'
    };
  }

  // Network/timeout errors
  if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    error = {
      message: 'Network error occurred',
      statusCode: 503,
      code: 'NETWORK_ERROR'
    };
  }

  // Permission errors
  if (err.code === 'EACCES' || err.code === 'EPERM') {
    error = {
      message: 'Permission denied',
      statusCode: 403,
      code: 'PERMISSION_DENIED'
    };
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    message: error.message || 'Internal server error',
    code: error.code || 'INTERNAL_ERROR'
  };

  // Add additional error details in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.details = error;
  }

  // Add specific error fields if they exist
  if (error.errors) {
    response.errors = error.errors;
  }

  if (error.field) {
    response.field = error.field;
  }

  if (error.retryAfter) {
    response.retryAfter = error.retryAfter;
    res.set('Retry-After', error.retryAfter);
  }

  res.status(statusCode).json(response);
};

// 404 handler for undefined routes
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  error.code = 'ROUTE_NOT_FOUND';
  next(error);
};

// Async error handler wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode, code = 'APP_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes
export class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTH_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests', retryAfter = 900) {
    super(message, 429, 'RATE_LIMITED');
    this.retryAfter = retryAfter;
  }
}

export class ServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500, 'SERVER_ERROR');
  }
}