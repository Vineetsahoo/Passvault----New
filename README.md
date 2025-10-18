# PassVault Application Setup

This guide will help you set up and run both the frontend and backend of your PassVault application.

## Project Structure

```
project-bolt-sb1-mwhaph4t/
├── client/          # React frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
└── server/          # Node.js backend API
    ├── models/
    ├── routes/
    ├── middleware/
    ├── utils/
    ├── package.json
    └── ...
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git** (optional, for version control)

## Quick Setup

### Step 1: Install Dependencies

Open two terminal windows and navigate to the project root:

**Terminal 1 - Backend Setup:**
```bash
cd server
npm install
```

**Terminal 2 - Frontend Setup:**
```bash
cd client
npm install
```

### Step 2: Configure Environment Variables

**Backend Configuration (server/.env):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/passvault
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=24h
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-this-in-production
JWT_REFRESH_EXPIRE=7d
BCRYPT_SALT_ROUNDS=12
CLIENT_URL=http://localhost:5173
ENCRYPTION_KEY=your-32-character-encryption-key-here-change-this
```

**Frontend Configuration (client/.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_NODE_ENV=development
VITE_DEBUG=true
```

### Step 3: Set Up Database

**Option A: Local MongoDB**
1. Install MongoDB on your system
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb/brew/mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

**Option B: MongoDB Atlas (Cloud)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in server/.env

### Step 4: Start the Applications

**Terminal 1 - Start Backend:**
```bash
cd server
npm run dev
```
The backend will start on `http://localhost:5000`

**Terminal 2 - Start Frontend:**
```bash
cd client
npm run dev
```
The frontend will start on `http://localhost:5173`

## Development Workflow

### Backend Development (server/)

**Available Scripts:**
```bash
npm run dev      # Start with hot reload (development)
npm start        # Start production server
npm test         # Run tests
```

**Key Features:**
- JWT-based authentication
- Password encryption and secure storage
- Rate limiting and security middleware
- Comprehensive logging
- RESTful API design

### Frontend Development (client/)

**Available Scripts:**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

**Key Features:**
- React with TypeScript
- Modern UI with Tailwind CSS
- Framer Motion animations
- Responsive design
- Real-time authentication

## Authentication System

The application supports both real backend authentication and demo mode:

### Backend Authentication
- Register new users with secure password hashing
- Login with JWT tokens and refresh token rotation
- Protected routes and middleware
- Account lockout and security features

### Demo Mode (Fallback)
If the backend is not running, the app falls back to demo mode:
- **Demo Email:** `RahulSingh05@gmail.com`
- **Demo Password:** `Rahul05@`

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user info |

### Password Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/passwords` | Get all passwords |
| POST | `/api/passwords` | Create new password |
| GET | `/api/passwords/:id` | Get specific password |
| PUT | `/api/passwords/:id` | Update password |
| DELETE | `/api/passwords/:id` | Delete password |

## Testing the Setup

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Register a New User:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "password": "TestPass123!"
     }'
   ```

3. **Frontend Access:**
   - Open `http://localhost:5173` in your browser
   - Try logging in with demo credentials or register a new account

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check if MongoDB is running
- Verify environment variables in `.env`
- Check for port conflicts (port 5000)

**Frontend can't connect to backend:**
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in client/.env
- Verify CORS configuration

**Database connection errors:**
- Check MongoDB connection string
- Ensure MongoDB service is running
- Verify database permissions

**Authentication issues:**
- Check JWT secret configuration
- Clear browser localStorage
- Verify token expiration settings

### Debug Mode

**Enable verbose logging:**
```bash
# Backend
NODE_ENV=development npm run dev

# Frontend
VITE_DEBUG=true npm run dev
```

## Production Deployment

### Backend Production

1. **Set production environment:**
   ```env
   NODE_ENV=production
   JWT_SECRET=your-production-secret-key
   MONGODB_URI=your-production-mongodb-uri
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

### Frontend Production

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder** to your hosting service

## Security Considerations

- Change default JWT secrets in production
- Use HTTPS in production
- Configure proper CORS origins
- Set up rate limiting
- Enable security headers
- Regular security updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

If you need help:
1. Check this documentation
2. Review the individual README files in `client/` and `server/`
3. Check the troubleshooting section
4. Create an issue with detailed information

## License

This project is licensed under the MIT License.