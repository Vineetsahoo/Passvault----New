# PassVault Deployment Guide 🚀

## Overview
This guide will help you deploy your PassVault application with:
- **Frontend (React + Vite)**: Deployed on Vercel
- **Backend (Node.js + Express)**: Deployed on Render or Railway
- **Database (MongoDB)**: MongoDB Atlas (free tier)

## Quick Deployment Steps

### Step 1: Deploy Database (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Sign up for free

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose FREE tier (M0 Sandbox)
   - Select a cloud provider & region (closest to you)
   - Click "Create Cluster"

3. **Configure Database Access**
   - Go to "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Create username & password (SAVE THESE!)
   - Set privileges to "Read and write to any database"

4. **Configure Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm

5. **Get Connection String**
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/passvault?retryWrites=true&w=majority`

### Step 2: Deploy Backend (Render)

1. **Go to Render**
   - Visit: https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `PassVault--New`
   - Configure:
     - **Name**: `passvault-backend`
     - **Region**: Choose closest to you
     - **Branch**: `main`
     - **Root Directory**: `server`
     - **Runtime**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: Free

3. **Add Environment Variables**
   Click "Environment" tab and add:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<generate-a-random-32-character-string>
   JWT_REFRESH_SECRET=<generate-another-random-32-character-string>
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

   **To generate JWT secrets** (run in PowerShell):
   ```powershell
   -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy your backend URL: `https://passvault-backend.onrender.com`

### Step 3: Deploy Frontend (Vercel)

1. **Go to Vercel**
   - Visit: https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your repository: `PassVault--New`
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `client`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

3. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   VITE_API_URL=https://passvault-backend.onrender.com/api
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)
   - Your site will be live at: `https://passvault-new.vercel.app`

5. **Update Backend CORS**
   - Go back to Render
   - Update `FRONTEND_URL` environment variable with your Vercel URL
   - Save and redeploy

## Alternative: Deploy Backend on Railway

### Railway Deployment Steps

1. **Go to Railway**
   - Visit: https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select `PassVault--New`

3. **Configure Service**
   - Choose the `server` folder as root
   - Railway will auto-detect Node.js

4. **Add Environment Variables**
   Go to Variables tab:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<random-secret>
   JWT_REFRESH_SECRET=<random-secret>
   FRONTEND_URL=<your-vercel-url>
   ```

5. **Generate Domain**
   - Go to Settings → Networking
   - Click "Generate Domain"
   - Copy the URL

6. **Update Vercel**
   - Update `VITE_API_URL` in Vercel with Railway URL

## Configuration Files

### 1. Create `vercel.json` in client folder

### 2. Create `.env.production` in server folder

### 3. Update `server/server.js` CORS configuration (already done)

## Post-Deployment Checklist

### Backend Verification
- [ ] Backend URL is accessible
- [ ] Health endpoint works: `https://your-backend.onrender.com/health`
- [ ] Database connection successful (check logs)
- [ ] CORS configured for frontend URL

### Frontend Verification
- [ ] Frontend loads successfully
- [ ] Can navigate to all pages
- [ ] Sign up works
- [ ] Sign in works
- [ ] Dashboard accessible after login
- [ ] API calls work (check Network tab)

### Test Full Flow
1. Open your frontend URL
2. Sign up with test account
3. Sign in
4. Add a card/pass
5. Check alerts
6. Test notifications
7. Test all features

## Troubleshooting

### Backend Issues

**Problem**: Backend not starting
- Check Render/Railway logs
- Verify MongoDB connection string
- Ensure all environment variables are set

**Problem**: Database connection failed
- Verify MongoDB Atlas IP whitelist (0.0.0.0/0)
- Check username/password in connection string
- Ensure cluster is active

**Problem**: CORS errors
- Verify `FRONTEND_URL` matches your Vercel URL exactly
- Check CORS configuration in `server.js`

### Frontend Issues

**Problem**: API calls failing
- Verify `VITE_API_URL` is set correctly
- Check if backend is running
- Verify API endpoints in browser Network tab

**Problem**: Build fails
- Check build logs in Vercel
- Verify all dependencies are in `package.json`
- Test build locally: `npm run build`

**Problem**: 404 on page refresh
- Vercel handles this automatically with SPA routing
- Verify `vercel.json` is configured correctly

## Environment Variables Summary

### Backend (Render/Railway)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/passvault
JWT_SECRET=your-secret-key-32-characters-long
JWT_REFRESH_SECRET=another-secret-key-32-chars
FRONTEND_URL=https://passvault-new.vercel.app
```

### Frontend (Vercel)
```env
VITE_API_URL=https://passvault-backend.onrender.com/api
```

## Custom Domain (Optional)

### Add Custom Domain to Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records as instructed
4. Wait for SSL certificate (automatic)

### Add Custom Domain to Backend
1. Go to Render → Settings → Custom Domain
2. Add your API domain (e.g., api.yoursite.com)
3. Configure DNS CNAME record
4. Update CORS in backend

## Monitoring & Maintenance

### Free Tier Limitations

**Render Free Tier**:
- Sleeps after 15 minutes of inactivity
- Takes 30-60 seconds to wake up
- 750 hours/month

**Railway Free Tier**:
- $5 credit/month
- No sleep mode
- Better for small apps

**Vercel Free Tier**:
- Unlimited deployments
- 100GB bandwidth/month
- Automatic SSL

### Keep Backend Awake

Create a cron job to ping your backend every 10 minutes:
```bash
# Use cron-job.org or uptimerobot.com
GET https://your-backend.onrender.com/health
```

## Automatic Deployments

Both Vercel and Render support automatic deployments:
- Push to `main` branch → Auto-deploy
- Push to other branches → Preview deployments

## Cost Estimates

**Free Tier (Perfect for Testing)**:
- MongoDB Atlas: Free (512MB storage)
- Render/Railway: Free (with limitations)
- Vercel: Free (generous limits)
- **Total: $0/month**

**Paid Tier (For Production)**:
- MongoDB Atlas: $9/month (2GB storage)
- Render: $7/month (no sleep mode)
- Vercel: Free (usually sufficient)
- **Total: ~$16/month**

## Next Steps After Deployment

1. **Set up monitoring** (Render has built-in monitoring)
2. **Configure email service** (for password reset, notifications)
3. **Add analytics** (Google Analytics, Plausible)
4. **Set up error tracking** (Sentry)
5. **Create backup strategy** (MongoDB Atlas auto-backups)
6. **Add uptime monitoring** (UptimeRobot)

## Support

If you encounter issues during deployment:
1. Check deployment logs
2. Verify environment variables
3. Test API endpoints manually
4. Check MongoDB Atlas connection
5. Review CORS configuration

---

**Ready to deploy?** Follow the steps above, and your PassVault app will be live in 30 minutes! 🚀
