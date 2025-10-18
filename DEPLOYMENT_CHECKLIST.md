# 🚀 PassVault Deployment Checklist

## Pre-Deployment

### Local Testing
- [ ] Frontend runs successfully (`npm run dev`)
- [ ] Backend runs successfully (`npm run dev`)
- [ ] Both run together (`npm run dev:both`)
- [ ] All features tested locally
- [ ] No console errors
- [ ] Build succeeds (`npm run build` in client folder)

### Code Repository
- [ ] All code pushed to GitHub
- [ ] Repository is public or connected to deployment platforms
- [ ] .gitignore is properly configured
- [ ] README.md is up to date

## Database Setup (MongoDB Atlas)

- [ ] MongoDB Atlas account created
- [ ] Free cluster created (M0)
- [ ] Database user created with credentials saved
- [ ] Network access configured (0.0.0.0/0 for development)
- [ ] Connection string copied and saved
- [ ] Connection string tested locally

**Connection String Format:**
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/passvault?retryWrites=true&w=majority
```

## Backend Deployment (Render)

### Account Setup
- [ ] Render account created (render.com)
- [ ] GitHub connected to Render

### Service Configuration
- [ ] New Web Service created
- [ ] Repository selected: PassVault--New
- [ ] Root directory set to: `server`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Instance type: Free

### Environment Variables
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `5000`
- [ ] `MONGODB_URI` = `<your-mongodb-connection-string>`
- [ ] `JWT_SECRET` = `<32-character-random-string>`
- [ ] `JWT_REFRESH_SECRET` = `<32-character-random-string>`
- [ ] `FRONTEND_URL` = `<will-update-after-frontend-deploy>`

### Deployment
- [ ] Service deployed successfully
- [ ] No errors in deployment logs
- [ ] Health check passes: `https://your-backend.onrender.com/health`
- [ ] Backend URL saved

## Frontend Deployment (Vercel)

### Account Setup
- [ ] Vercel account created (vercel.com)
- [ ] GitHub connected to Vercel

### Project Configuration
- [ ] New project created
- [ ] Repository selected: PassVault--New
- [ ] Root directory set to: `client`
- [ ] Framework preset: Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`

### Environment Variables
- [ ] `VITE_API_URL` = `https://your-backend.onrender.com/api`

### Deployment
- [ ] Project deployed successfully
- [ ] No build errors
- [ ] Site accessible
- [ ] Frontend URL saved

## Post-Deployment Configuration

### Update Backend CORS
- [ ] Go to Render backend service
- [ ] Update `FRONTEND_URL` with Vercel URL
- [ ] Save and trigger manual redeploy
- [ ] Wait for deployment to complete

### Verify Integration
- [ ] Frontend can reach backend API
- [ ] No CORS errors in browser console
- [ ] API calls work in Network tab

## Testing Deployed Application

### Basic Functionality
- [ ] Homepage loads
- [ ] All pages accessible (About, Features, etc.)
- [ ] Navigation works
- [ ] Responsive design works on mobile

### Authentication Flow
- [ ] Sign Up page loads
- [ ] Can create new account
- [ ] Receives success message
- [ ] Sign In page loads
- [ ] Can sign in with created account
- [ ] Redirects to dashboard after login

### Dashboard Features
- [ ] Dashboard loads after login
- [ ] User profile displays correctly
- [ ] All dashboard tabs work:
  - [ ] Passwords
  - [ ] Notifications
  - [ ] Settings
  - [ ] History
  - [ ] Monitoring
  - [ ] Transactions
  - [ ] Backup
  - [ ] User Profile

### Core Features
- [ ] QR Scan page loads
- [ ] Can add new card/pass
- [ ] Cards display correctly
- [ ] Can view card details
- [ ] Can edit card
- [ ] Can delete card
- [ ] Alerts page works
- [ ] Expired items show alerts
- [ ] Notifications display
- [ ] Alerts appear in notifications

### Sign Out
- [ ] Sign out button works
- [ ] Redirects to home page
- [ ] Cannot access dashboard after sign out
- [ ] localStorage cleared

## Performance Checks

### Frontend (Vercel)
- [ ] Page load time < 3 seconds
- [ ] Lighthouse score > 80
- [ ] No 404 errors
- [ ] Images load correctly
- [ ] CSS/JS bundled properly

### Backend (Render)
- [ ] API response time < 2 seconds
- [ ] Health endpoint responds quickly
- [ ] Database queries efficient
- [ ] No memory leaks
- [ ] Logs show no errors

## Security Checks

- [ ] HTTPS enabled (automatic on Vercel & Render)
- [ ] Environment variables not exposed
- [ ] JWT secrets are secure
- [ ] Database credentials secure
- [ ] CORS configured correctly
- [ ] No sensitive data in client code
- [ ] API routes protected with authentication

## Monitoring Setup (Optional)

- [ ] Uptime monitoring configured (UptimeRobot)
- [ ] Error tracking set up (Sentry)
- [ ] Analytics added (Google Analytics)
- [ ] Performance monitoring enabled

## Documentation

- [ ] Deployment guide reviewed
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Known issues documented
- [ ] Troubleshooting guide available

## Final Verification

### URLs
- Frontend URL: `https://_____________________.vercel.app`
- Backend URL: `https://_____________________.onrender.com`
- Database: `MongoDB Atlas Cluster: _____________________`

### Credentials
- [x] MongoDB credentials saved securely
- [x] JWT secrets saved securely
- [x] Admin account created
- [x] Test account created

### Status
- [ ] ✅ Application fully deployed
- [ ] ✅ All features working
- [ ] ✅ No critical errors
- [ ] ✅ Ready for users

## Troubleshooting

### If Backend Fails to Start
1. Check Render logs for errors
2. Verify MongoDB connection string
3. Ensure all environment variables are set
4. Check if cluster is active in MongoDB Atlas

### If Frontend Can't Reach Backend
1. Verify VITE_API_URL is correct
2. Check CORS configuration in backend
3. Ensure backend is running (not asleep)
4. Check browser Network tab for errors

### If CORS Errors Appear
1. Verify FRONTEND_URL in backend matches exact Vercel URL
2. Check CORS middleware in server.js
3. Ensure no trailing slashes in URLs
4. Redeploy backend after changes

### If MongoDB Connection Fails
1. Check IP whitelist (should be 0.0.0.0/0)
2. Verify username and password
3. Ensure cluster is not paused
4. Test connection string locally first

## Success! 🎉

Once all checkboxes are marked, your PassVault application is successfully deployed and ready to use!

**Share your app:**
- Website: https://your-app.vercel.app
- API: https://your-backend.onrender.com

---

**Deployment Date:** _____________________  
**Deployed By:** _____________________  
**Version:** 1.0.0
