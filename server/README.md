# PassVault Backend

A secure Node.js/Express backend for the PassVault password manager application.

## Features

- 🔐 **Secure Authentication** - JWT-based authentication with refresh tokens
- 🛡️ **Password Management** - Encrypted storage and management of passwords
- 👥 **User Management** - User profiles, preferences, and account management
- 🔒 **Security Features** - Rate limiting, account lockout, and security monitoring
- 📊 **Analytics** - Password strength analysis and security statistics
- 🚀 **Performance** - Optimized database queries and caching
- 📝 **Logging** - Comprehensive logging with Winston
- 🛠️ **Development** - Hot reload with nodemon and debugging support

## Tech Stack

- **Runtime**: Node.js (ES6 Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs, helmet, cors, express-rate-limit
- **Validation**: joi, express-validator
- **Logging**: winston
- **Development**: nodemon

## Quick Start

### Prerequisites

- Node.js 16+ installed
- MongoDB running locally or connection string to MongoDB Atlas
- Git

### Installation

1. **Clone and Navigate**
   ```bash
   cd server
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

### Production Setup

1. **Install Production Dependencies**
   ```bash
   npm install --production
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

## Configuration

### Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/passvault

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=24h
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key
JWT_REFRESH_EXPIRE=7d

# Security
BCRYPT_SALT_ROUNDS=12
ENCRYPTION_KEY=your-32-character-encryption-key-here

# CORS
CLIENT_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Database Setup

The application uses MongoDB. You can either:

1. **Local MongoDB**: Install MongoDB locally
2. **MongoDB Atlas**: Use the cloud service
3. **Docker**: Run MongoDB in a container

The application will automatically create collections and indexes on first run.

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update user profile |
| PUT | `/api/user/password` | Change password |
| DELETE | `/api/user/account` | Delete account |

### Password Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/passwords` | Get all passwords |
| POST | `/api/passwords` | Create new password |
| GET | `/api/passwords/:id` | Get specific password |
| PUT | `/api/passwords/:id` | Update password |
| DELETE | `/api/passwords/:id` | Delete password |

### Example API Usage

#### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

#### Create Password Entry
```bash
curl -X POST http://localhost:5000/api/passwords \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Gmail Account",
    "username": "john@gmail.com",
    "password": "MySecretPassword123",
    "website": "https://gmail.com",
    "category": "email"
  }'
```

## Security Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Password hashing with bcrypt (configurable salt rounds)
- Account lockout after failed login attempts
- Session management across multiple devices

### Data Protection
- Password encryption using AES-256-GCM
- Secure password storage with user-specific encryption
- Input validation and sanitization
- CORS protection and security headers

### Rate Limiting
- Global rate limiting for all API endpoints
- Stricter limits for authentication endpoints
- IP-based tracking and blocking

### Monitoring & Logging
- Comprehensive request/response logging
- Security event monitoring
- Error tracking and performance metrics
- Audit trail for user actions

## Development

### Scripts

```bash
# Development with hot reload
npm run dev

# Production start
npm start

# Run tests
npm test
```

### Project Structure

```
server/
├── models/           # Database models
│   ├── User.js      # User model with authentication
│   └── Password.js  # Password model with encryption
├── routes/          # API routes
│   ├── auth.js      # Authentication routes
│   ├── user.js      # User management routes
│   └── passwords.js # Password management routes
├── middleware/      # Custom middleware
│   ├── auth.js      # Authentication middleware
│   └── errorHandler.js # Error handling middleware
├── utils/           # Utility functions
│   ├── tokenUtils.js # JWT token utilities
│   └── logger.js    # Logging configuration
├── logs/           # Log files (auto-created)
├── server.js       # Main application file
└── package.json    # Dependencies and scripts
```

### Adding New Features

1. **Create Model** (if needed) in `models/`
2. **Add Routes** in `routes/`
3. **Add Middleware** (if needed) in `middleware/`
4. **Register Routes** in `server.js`
5. **Add Tests** for new functionality

### Database Models

#### User Model
- Authentication and profile data
- Security settings and preferences
- Session management
- Account status and verification

#### Password Model
- Encrypted password storage
- Metadata and categorization
- Sharing and collaboration features
- Security analysis and monitoring

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test auth.test.js
```

## Deployment

### Production Checklist

- [ ] Set strong `JWT_SECRET` and `ENCRYPTION_KEY`
- [ ] Configure production MongoDB connection
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backups

### Docker Deployment

```bash
# Build image
docker build -t passvault-backend .

# Run container
docker run -d \
  --name passvault-api \
  -p 5000:5000 \
  -e MONGODB_URI=mongodb://mongodb:27017/passvault \
  -e JWT_SECRET=your-production-secret \
  passvault-backend
```

## Monitoring

### Health Check

The server provides a health check endpoint:

```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

### Logs

Logs are stored in the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only
- `exceptions.log` - Uncaught exceptions
- `rejections.log` - Unhandled promise rejections

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues:

1. Check the [troubleshooting guide](#troubleshooting)
2. Search existing [issues](../../issues)
3. Create a new issue with detailed information

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network connectivity

**Authentication Errors**
- Check JWT secret configuration
- Verify token expiration settings
- Clear browser cookies and localStorage

**Rate Limiting Issues**
- Adjust rate limiting configuration
- Check IP whitelisting
- Monitor request patterns

**Performance Issues**
- Enable database indexing
- Configure connection pooling
- Monitor memory usage and logs