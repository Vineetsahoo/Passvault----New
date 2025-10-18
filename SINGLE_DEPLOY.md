# 🚀 Single Deployment Guide - Frontend + Backend Together

## Overview
Deploy both frontend and backend as a single application where Express serves the React build files.

## Architecture
```
Express Server (Port 5000)
├── API Routes (/api/*)
└── Static Files (React build) (/)
```

## Deployment Steps

### Step 1: Prepare for Single Deployment

The server is already configured to serve the client build files. We just need to ensure everything builds correctly.

### Step 2: Deploy to Render (Unified App)

1. **Go to Render**: https://render.com
2. **Sign in with GitHub**
3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Select repository: `PassVault--New`

4. **Configure Service**:
   ```
   Name: passvault-app
   Region: Choose closest to you
   Branch: main
   Root Directory: (leave blank - use repository root)
   Runtime: Node
   Build Command: npm run build:all
   Start Command: npm start
   Instance Type: Free
   ```

5. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<random-32-char-string>
   JWT_REFRESH_SECRET=<random-32-char-string>
   ```

6. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment

### Step 3: Access Your App

Your entire application will be accessible at:
```
https://passvault-app.onrender.com
```

- Frontend: `https://passvault-app.onrender.com/`
- API: `https://passvault-app.onrender.com/api/*`
- Health: `https://passvault-app.onrender.com/health`

## How It Works

1. **Build Process**:
   - Installs root dependencies
   - Installs client dependencies
   - Installs server dependencies
   - Builds React app to `client/dist`

2. **Runtime**:
   - Express server starts
   - Serves API routes on `/api/*`
   - Serves React build files for all other routes
   - React Router handles client-side routing

## MongoDB Atlas Setup

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create M0 (FREE) cluster
4. Database Access:
   - Create username & password
   - Save credentials!
5. Network Access:
   - Add IP: 0.0.0.0/0 (Allow from anywhere)
6. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password

## Environment Variables

Generate JWT secrets using PowerShell:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

Run this twice to get two different secrets.

## Alternative: Deploy to Railway

1. **Go to Railway**: https://railway.app
2. **Sign in with GitHub**
3. **New Project** → "Deploy from GitHub repo"
4. **Select**: PassVault--New
5. **Configure**:
   - Build Command: `npm run build:all`
   - Start Command: `npm start`
6. **Add Environment Variables** (same as above)
7. **Generate Domain**
8. **Done!**

## Alternative: Deploy to Cyclic

1. **Go to Cyclic**: https://www.cyclic.sh
2. **Connect GitHub**
3. **Deploy PassVault--New**
4. **Add Environment Variables**
5. **Automatic deployment!**

## Testing Deployed App

1. Visit your deployment URL
2. Homepage should load
3. Navigate to different pages
4. Sign up for account
5. Sign in
6. Access dashboard
7. Add card/pass
8. Check alerts
9. Test all features

## Advantages of Single Deployment

✅ **Simpler**: One deployment instead of two
✅ **Cheaper**: One server instead of two (free tier)
✅ **No CORS**: Frontend and backend on same domain
✅ **Faster**: No cross-origin requests
✅ **Easier**: Single URL to manage

## Disadvantages

❌ Server must rebuild client on changes
❌ Longer build times
❌ Cannot scale frontend/backend independently

## Troubleshooting

### Build Fails
- Check if all dependencies are in package.json
- Verify build:all script works locally
- Check Render/Railway logs

### App Not Loading
- Check if PORT is set to 5000
- Verify static file serving in server.js
- Check deployment logs

### API Not Working
- Verify MongoDB connection string
- Check environment variables
- Test health endpoint

### 404 on Refresh
- Express should handle SPA routing (already configured)
- Check server.js fallback route

## Local Testing

Test the production setup locally:

```bash
# Build everything
npm run build:all

# Set environment variables
$env:NODE_ENV="production"
$env:MONGODB_URI="your-mongodb-uri"
$env:JWT_SECRET="your-secret"
$env:JWT_REFRESH_SECRET="your-secret"

# Start server
cd server
npm start

# Visit http://localhost:5000
```

## Success Criteria

✅ Build completes successfully
✅ Server starts without errors
✅ Frontend loads at root URL
✅ API endpoints respond
✅ Database connects
✅ Authentication works
✅ All features functional

## Cost

**Free Tier**:
- MongoDB Atlas: Free (512MB)
- Render/Railway: Free (with sleep mode)
- **Total: $0/month**

**Paid Tier**:
- MongoDB Atlas: $9/month
- Render: $7/month (no sleep)
- **Total: $16/month**

## Quick Summary

```bash
# 1. Create MongoDB Atlas cluster (free)
# 2. Get connection string
# 3. Go to Render.com
# 4. New Web Service → Connect GitHub
# 5. Root directory: (blank)
# 6. Build: npm run build:all
# 7. Start: npm start
# 8. Add environment variables
# 9. Deploy!
# 10. App live at: https://your-app.onrender.com
```

## Next Steps

1. Follow this guide to deploy
2. Test your deployed app
3. Share with users!
4. Monitor performance
5. Add custom domain (optional)

---

**Deployment time: 30 minutes**
**Cost: FREE**
**Complexity: Low**
