# Running Frontend & Backend Together - Complete Setup ✅

## Overview
You can now run both the frontend (React/Vite) and backend (Node.js/Express) servers simultaneously with a single command!

## Installation

### What Was Installed
- **concurrently** - A package that allows running multiple npm scripts in parallel

### Command Used
```bash
cd client
npm install --save-dev concurrently
```

## New Scripts Added

### In `client/package.json`:

```json
"scripts": {
  "dev": "vite",
  "dev:backend": "cd ../server && npm run dev",
  "dev:both": "concurrently \"npm run dev\" \"npm run dev:backend\" --names \"CLIENT,SERVER\" --prefix-colors \"cyan,yellow\"",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "update-db": "npx update-browserslist-db@latest"
}
```

## Usage

### Run Both Servers Together
```bash
cd client
npm run dev:both
```

### What Happens
1. **Frontend (Vite)** starts on `http://localhost:5173/`
2. **Backend (Express)** starts on `http://localhost:5000/`
3. Both run in parallel with colored output:
   - **CLIENT** (cyan) - Frontend logs
   - **SERVER** (yellow) - Backend logs

### Output Example
```
[CLIENT] ➜  Local:   http://localhost:5173/
[CLIENT] ➜  Network: use --host to expose

[SERVER] 🚀 PassVault Server running on port 5000
[SERVER] 🌍 Environment: development
[SERVER] 📊 Health check: http://localhost:5000/health
[SERVER] 🔗 Frontend URL: http://localhost:5173
```

## Individual Server Commands

### Run Only Frontend
```bash
cd client
npm run dev
```
- Starts Vite dev server on port 5173

### Run Only Backend
```bash
cd server
npm run dev
```
- Starts Express server with nodemon on port 5000

## Features

### Concurrent Execution
- ✅ Both servers start simultaneously
- ✅ Color-coded output (CLIENT=cyan, SERVER=yellow)
- ✅ Labeled logs for easy identification
- ✅ Hot reload for both frontend and backend
- ✅ Single terminal window required

### Auto-Reload Capabilities
- **Frontend (Vite)**: Hot Module Replacement (HMR) - instant updates
- **Backend (Nodemon)**: Auto-restart on file changes

## Development Workflow

### Starting Development
```bash
# Navigate to client folder
cd client

# Start both servers
npm run dev:both
```

### Stopping Servers
- Press `Ctrl+C` in the terminal
- Both servers will stop gracefully

### Restarting Backend Only
- Type `rs` in the terminal and press Enter
- Backend will restart without affecting frontend

## Port Configuration

### Default Ports
- **Frontend**: 5173 (Vite default)
- **Backend**: 5000 (Express configured)

### Changing Ports

#### Frontend (Vite)
Edit `client/vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    port: 3000 // Change to desired port
  }
})
```

#### Backend (Express)
Edit `server/.env`:
```
PORT=5000
```
Or update `server/server.js`:
```javascript
const PORT = process.env.PORT || 5000;
```

## Troubleshooting

### Port Already in Use

**Frontend (Port 5173)**:
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Kill the process and restart
```

**Backend (Port 5000)**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill the process and restart
```

### Servers Not Starting

1. **Check Dependencies**:
   ```bash
   # In client folder
   npm install
   
   # In server folder
   cd ../server
   npm install
   ```

2. **Check MongoDB**:
   - Ensure MongoDB is running on `mongodb://localhost:27017`
   - Start MongoDB service if needed

3. **Check Environment Variables**:
   - Verify `server/.env` file exists
   - Ensure all required variables are set

### Logs Not Showing

If you don't see colored logs:
```bash
# Windows CMD might not support colors
# Use PowerShell or Windows Terminal instead
```

## CI/CD & Production

### Production Build

**Frontend**:
```bash
cd client
npm run build
```
- Builds to `client/dist/`

**Backend**:
```bash
cd server
npm start
```
- Runs production server (without nodemon)

### Environment-Specific Commands

```json
"scripts": {
  "dev:both": "concurrently \"npm run dev\" \"npm run dev:backend\"",
  "dev:both:verbose": "concurrently -k -n CLIENT,SERVER -c cyan,yellow \"npm run dev\" \"npm run dev:backend\"",
  "dev:both:quiet": "concurrently -r \"npm run dev\" \"npm run dev:backend\""
}
```

## Advanced Usage

### Kill All on Error
Add `-k` flag:
```json
"dev:both": "concurrently -k \"npm run dev\" \"npm run dev:backend\""
```
- Kills all processes if one fails

### Raw Output (No Prefixes)
Add `-r` flag:
```json
"dev:both": "concurrently -r \"npm run dev\" \"npm run dev:backend\""
```

### Success Criteria
Add success criteria:
```json
"dev:both": "concurrently --success first \"npm run dev\" \"npm run dev:backend\""
```

## Package.json Structure

### Client Package.json
```json
{
  "scripts": {
    "dev": "vite",                              // Frontend only
    "dev:backend": "cd ../server && npm run dev", // Backend only
    "dev:both": "concurrently ..."              // Both together
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

### Server Package.json
```json
{
  "scripts": {
    "start": "node server.js",    // Production
    "dev": "nodemon server.js"    // Development with auto-reload
  },
  "devDependencies": {
    "nodemon": "^3.1.7"
  }
}
```

## Benefits

### Developer Experience
✅ Single command to start everything  
✅ Consistent development environment  
✅ Easy onboarding for new developers  
✅ No need to manage multiple terminals  
✅ Colored output for clarity  

### Performance
✅ Both servers start in parallel (faster)  
✅ Hot reload on both frontend and backend  
✅ No manual restarts needed  

### Reliability
✅ Both servers stop together  
✅ Error handling built-in  
✅ Process management by concurrently  

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run dev:both` | Start both frontend & backend |
| `npm run dev` | Start frontend only |
| `npm run dev:backend` | Start backend only |
| `Ctrl+C` | Stop all servers |
| `rs` + Enter | Restart backend only |

## Testing

### Verify Setup
1. Run `npm run dev:both` from `client/` folder
2. Check logs:
   - `[CLIENT] ➜  Local: http://localhost:5173/`
   - `[SERVER] 🚀 PassVault Server running on port 5000`
3. Open browser: `http://localhost:5173`
4. Test API: `http://localhost:5000/health`

### Expected Output
```
[CLIENT] VITE v5.4.14 ready in 517 ms
[CLIENT] ➜  Local:   http://localhost:5173/
[SERVER] MongoDB connected successfully
[SERVER] 🚀 PassVault Server running on port 5000
```

## Success! ✅

Your development environment is now fully configured to run both frontend and backend with a single command:

```bash
cd client && npm run dev:both
```

---

**Status:** ✅ Fully Configured  
**Package:** concurrently@8.2.2  
**Command:** `npm run dev:both`  
**Date:** January 21, 2025
