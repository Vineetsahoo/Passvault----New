import winston from 'winston';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Create the format for logs
const format = winston.format.combine(
  // Add timestamp to logs
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:SSS' }),
  // Add colors to the logs
  winston.format.colorize({ all: true }),
  // Define the format of the message showing the timestamp, the level and the message
  winston.format.printf((info) => {
    const { timestamp, level, message, ...extra } = info;
    
    // Handle different types of data
    let logMessage = message;
    
    if (typeof message === 'object') {
      logMessage = JSON.stringify(message, null, 2);
    }
    
    // Add extra fields if they exist
    const extraInfo = Object.keys(extra).length > 0 ? `\n${JSON.stringify(extra, null, 2)}` : '';
    
    return `${timestamp} [${level}]: ${logMessage}${extraInfo}`;
  })
);

// Define which transports the logger will use
const transports = [
  // Console transport for development
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: join(__dirname, '../logs/error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: join(__dirname, '../logs/combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Create the logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Create logs directory if it doesn't exist
import { existsSync, mkdirSync } from 'fs';
const logsDir = join(__dirname, '../logs');
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

// Handle uncaught exceptions and unhandled rejections
if (process.env.NODE_ENV === 'production') {
  logger.exceptions.handle(
    new winston.transports.File({ 
      filename: join(__dirname, '../logs/exceptions.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  );

  logger.rejections.handle(
    new winston.transports.File({ 
      filename: join(__dirname, '../logs/rejections.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  );
}

// Helper functions for common logging patterns
export const logUserAction = (userId, action, details = {}) => {
  logger.info('User Action', {
    userId,
    action,
    details,
    timestamp: new Date().toISOString()
  });
};

export const logSecurityEvent = (type, details = {}) => {
  logger.warn('Security Event', {
    type,
    details,
    timestamp: new Date().toISOString()
  });
};

export const logDatabaseOperation = (operation, collection, details = {}) => {
  logger.debug('Database Operation', {
    operation,
    collection,
    details,
    timestamp: new Date().toISOString()
  });
};

export const logApiRequest = (req, duration = null) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user.userId : null,
    timestamp: new Date().toISOString()
  };
  
  if (duration !== null) {
    logData.duration = `${duration}ms`;
  }
  
  logger.http('API Request', logData);
};

export const logError = (error, context = {}) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    code: error.code,
    context,
    timestamp: new Date().toISOString()
  });
};

// Performance logging
export const createPerformanceLogger = (operation) => {
  const start = Date.now();
  
  return {
    end: (details = {}) => {
      const duration = Date.now() - start;
      logger.debug('Performance', {
        operation,
        duration: `${duration}ms`,
        details,
        timestamp: new Date().toISOString()
      });
      return duration;
    }
  };
};

// Middleware for logging HTTP requests
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logApiRequest(req);
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http('API Response', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user ? req.user.userId : null,
      timestamp: new Date().toISOString()
    });
  });
  
  next();
};

export default logger;