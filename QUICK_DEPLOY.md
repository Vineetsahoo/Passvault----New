# 🚀 Quick Start Deployment Guide

## Deploy Your PassVault App in 3 Steps (30 Minutes)

### Step 1: Deploy Database (5 minutes)
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create FREE account
3. Create M0 (FREE) cluster
4. Set username & password
5. Allow access from anywhere (0.0.0.0/0)
6. Copy connection string

### Step 2: Deploy Backend (10 minutes)
1. Go to https://render.com
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Select repository: `PassVault--New`
5. Settings:
   - Root Directory: `server`
   - Build: `npm install`
   - Start: `npm start`
6. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=<paste-mongodb-connection-string>
   JWT_SECRET=<any-random-32-char-string>
   JWT_REFRESH_SECRET=<any-random-32-char-string>
   FRONTEND_URL=https://temp-url.com
   ```
7. Deploy & copy backend URL

### Step 3: Deploy Frontend (10 minutes)
1. Go to https://vercel.com
2. Sign in with GitHub
3. Import project: `PassVault--New`
4. Settings:
   - Root Directory: `client`
   - Framework: Vite
   - Build: `npm run build`
   - Output: `dist`
5. Add Environment Variable:
   ```
   VITE_API_URL=<paste-backend-url-from-step-2>/api
   ```
6. Deploy & copy frontend URL

### Step 4: Update Backend (5 minutes)
1. Go back to Render
2. Update `FRONTEND_URL` with Vercel URL from Step 3
3. Redeploy

## Done! 🎉

Your app is now live at:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-app.onrender.com

## Test Your Deployment

1. Open your Vercel URL
2. Click "Sign Up"
3. Create account
4. Sign in
5. Add a card/pass
6. Check alerts
7. Everything works!

## Important Notes

- ⏰ **Render Free Tier**: Backend sleeps after 15 min inactivity (wakes in 30-60 seconds)
- 💰 **Total Cost**: $0/month (all free tiers)
- 🔒 **Security**: HTTPS enabled automatically
- 🔄 **Auto-Deploy**: Push to GitHub = auto-deploy

## Need Help?

Read the full guides:
- `DEPLOYMENT_GUIDE.md` - Complete step-by-step guide
- `DEPLOYMENT_CHECKLIST.md` - Testing checklist
- `DEV_SETUP.md` - Local development setup

## Deployment Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Render Dashboard**: https://dashboard.render.com
- **MongoDB Atlas**: https://cloud.mongodb.com

---

**Your turn!** Follow the 4 steps above and deploy your PassVault app now! 🚀
