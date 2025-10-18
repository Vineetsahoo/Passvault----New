import { spawn } from 'child_process';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n🎉 Welcome to PassVault Backend Initialization!\n');
console.log('This script will set up your entire backend environment.\n');

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n⚡ Running: ${command} ${args.join(' ')}\n`);
    
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`${command} failed with code ${code}`));
      } else {
        resolve();
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

async function checkMongoDBInstalled() {
  try {
    await runCommand('mongod', ['--version']);
    return true;
  } catch (error) {
    return false;
  }
}

async function checkMongoDBRunning() {
  try {
    await runCommand('mongosh', ['--eval', 'db.version()', '--quiet']);
    return true;
  } catch (error) {
    return false;
  }
}

async function initialize() {
  try {
    console.log('📋 Step 1: Checking prerequisites...\n');
    
    // Check Node.js
    console.log('   ✓ Node.js is installed');
    
    // Check MongoDB
    const mongoInstalled = await checkMongoDBInstalled();
    if (mongoInstalled) {
      console.log('   ✓ MongoDB is installed');
      
      const mongoRunning = await checkMongoDBRunning();
      if (mongoRunning) {
        console.log('   ✓ MongoDB is running');
      } else {
        console.log('   ⚠️  MongoDB is not running');
        console.log('   💡 Trying to start MongoDB service...');
        try {
          await runCommand('net', ['start', 'MongoDB']);
          console.log('   ✓ MongoDB started successfully');
        } catch (error) {
          console.log('   ⚠️  Could not start MongoDB automatically');
          console.log('   💡 Please start MongoDB manually or use MongoDB Atlas');
        }
      }
    } else {
      console.log('   ⚠️  MongoDB not found on local machine');
      console.log('   💡 You can:');
      console.log('      1. Install MongoDB from: https://www.mongodb.com/try/download/community');
      console.log('      2. Or use MongoDB Atlas (cloud database)');
      console.log('\n   The setup will continue - you can configure MongoDB Atlas in the next step.\n');
    }

    // Check if .env exists
    const envPath = join(__dirname, '..', '.env');
    const envExists = fs.existsSync(envPath);
    
    if (!envExists) {
      console.log('\n📋 Step 2: Setting up environment variables...\n');
      await runCommand('node', ['scripts/setup.js']);
    } else {
      console.log('\n📋 Step 2: Environment variables already configured\n');
      console.log('   ✓ .env file exists');
      console.log('   💡 Run "npm run setup" to reconfigure\n');
    }

    console.log('\n📋 Step 3: Testing database connection...\n');
    await runCommand('node', ['scripts/testDb.js']);

    console.log('\n📋 Step 4: Seeding test data...\n');
    await runCommand('node', ['scripts/seed.js']);

    console.log('\n✨ Initialization Complete!\n');
    console.log('🎊 Your PassVault backend is ready!\n');
    console.log('Next steps:');
    console.log('   1. Start the server: npm run dev');
    console.log('   2. Test the API: curl http://localhost:5000/health');
    console.log('   3. Connect your frontend to http://localhost:5000\n');
    console.log('📚 For more information, check:');
    console.log('   - QUICKSTART.md - Quick setup guide');
    console.log('   - DATABASE_SETUP.md - Detailed database setup\n');

  } catch (error) {
    console.error('\n❌ Initialization failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   - Make sure MongoDB is installed and running');
    console.error('   - Check your .env configuration');
    console.error('   - Run steps manually:');
    console.error('     1. npm run setup');
    console.error('     2. npm run test:db');
    console.error('     3. npm run seed');
    console.error('\n');
    process.exit(1);
  }
}

// Run initialization
initialize();
