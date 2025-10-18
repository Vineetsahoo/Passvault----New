import jwt from 'jsonwebtoken';

// Generate access and refresh tokens
export const generateTokens = (userId, accessTokenExpiry = '24h') => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { 
      expiresIn: accessTokenExpiry,
      issuer: 'passvault-api',
      audience: 'passvault-client'
    }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
      issuer: 'passvault-api',
      audience: 'passvault-client'
    }
  );

  return { accessToken, refreshToken };
};

// Verify access token
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'passvault-api',
      audience: 'passvault-client'
    });
  } catch (error) {
    return null;
  }
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
      issuer: 'passvault-api',
      audience: 'passvault-client'
    });
  } catch (error) {
    return null;
  }
};

// Decode token without verification (useful for getting info from expired tokens)
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp < now;
};

// Get token expiration time
export const getTokenExpiration = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }
  
  return new Date(decoded.exp * 1000);
};

// Generate a secure random token for password reset, email verification, etc.
export const generateSecureToken = async (length = 32) => {
  const crypto = await import('crypto');
  return crypto.randomBytes(length).toString('hex');
};

// Create API key (for potential API access)
export const generateApiKey = async (prefix = 'pk', length = 32) => {
  const crypto = await import('crypto');
  const randomPart = crypto.randomBytes(length).toString('hex');
  return `${prefix}_${randomPart}`;
};

// Hash API key for storage
export const hashApiKey = async (apiKey) => {
  const crypto = await import('crypto');
  return crypto.createHash('sha256').update(apiKey).digest('hex');
};

// Generate short-lived token for sensitive operations
export const generateShortLivedToken = (userId, operation, expiresIn = '15m') => {
  return jwt.sign(
    { 
      userId, 
      operation,
      type: 'short-lived'
    },
    process.env.JWT_SECRET,
    { 
      expiresIn,
      issuer: 'passvault-api',
      audience: 'passvault-client'
    }
  );
};

// Verify short-lived token
export const verifyShortLivedToken = (token, expectedOperation) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'passvault-api',
      audience: 'passvault-client'
    });
    
    if (decoded.type !== 'short-lived' || decoded.operation !== expectedOperation) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
};

// Extract token from Authorization header
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

// Create token response object
export const createTokenResponse = (accessToken, refreshToken, user) => {
  const accessTokenDecoded = decodeToken(accessToken);
  
  return {
    accessToken,
    tokenType: 'Bearer',
    expiresIn: accessTokenDecoded ? accessTokenDecoded.exp - Math.floor(Date.now() / 1000) : 86400,
    expiresAt: getTokenExpiration(accessToken),
    user: {
      id: user._id || user.id,
      email: user.email,
      name: user.name,
      isEmailVerified: user.isEmailVerified
    }
  };
};