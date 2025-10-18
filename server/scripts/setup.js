import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function generateSecureKey(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

function generate32CharKey() {
  return crypto.randomBytes(16).toString('hex'); // 32 hex characters
}

async function setupEnvironment() {
  console.log('\n🔐 PassVault Backend Setup\n');
  console.log('This script will help you set up your environment variables.\n');

  // Ask for database type
  console.log('Choose your database option:');
  console.log('1. Local MongoDB (mongodb://localhost:27017/passvault)');
  console.log('2. MongoDB Atlas (Cloud)');
  console.log('3. Custom MongoDB URI\n');

  const dbChoice = await question('Enter your choice (1/2/3): ');
  
  let mongodbUri;
  if (dbChoice === '1') {
    mongodbUri = 'mongodb://localhost:27017/passvault';
  } else if (dbChoice === '2') {
    console.log('\n📝 Enter your MongoDB Atlas connection string:');
    console.log('Example: mongodb+srv://username:password@cluster.mongodb.net/passvault?retryWrites=true&w=majority\n');
    mongodbUri = await question('MongoDB Atlas URI: ');
  } else {
    mongodbUri = await question('Enter your MongoDB URI: ');
  }

  // Generate secure keys
  console.log('\n🔑 Generating secure keys...\n');
  const jwtSecret = generateSecureKey();
  const jwtRefreshSecret = generateSecureKey();
  const encryptionKey = generate32CharKey();

  // Ask for port
  const port = await question('Enter server port (default: 5000): ') || '5000';

  // Ask for client URL
  const clientUrl = await question('Enter frontend URL (default: http://localhost:5173): ') || 'http://localhost:5173';

  // Ask for environment
  console.log('\nChoose environment:');
  console.log('1. development');
  console.log('2. production\n');
  const envChoice = await question('Enter your choice (1/2): ');
  const nodeEnv = envChoice === '2' ? 'production' : 'development';

  // Create .env content
  const envContent = `# Environment variables for PassVault Backend
# Generated on ${new Date().toISOString()}

# Server Configuration
PORT=${port}
NODE_ENV=${nodeEnv}

# Database Configuration
MONGODB_URI=${mongodbUri}
DB_NAME=passvault

# JWT Configuration (Keep these secret!)
JWT_SECRET=${jwtSecret}
JWT_EXPIRE=24h
JWT_REFRESH_SECRET=${jwtRefreshSecret}
JWT_REFRESH_EXPIRE=7d

# Security
BCRYPT_SALT_ROUNDS=12

# CORS Configuration
CLIENT_URL=${clientUrl}

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (Optional - for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Encryption Key for sensitive data (Keep this secret!)
ENCRYPTION_KEY=${encryptionKey}
`;

  // Save to .env file
  const envPath = join(__dirname, '..', '.env');
  
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    const overwrite = await question('\n⚠️  .env file already exists. Overwrite? (yes/no): ');
    if (overwrite.toLowerCase() !== 'yes') {
      console.log('\n❌ Setup cancelled. Your existing .env file was not modified.\n');
      rl.close();
      return;
    }
    
    // Backup existing .env
    const backupPath = join(__dirname, '..', `.env.backup.${Date.now()}`);
    fs.copyFileSync(envPath, backupPath);
    console.log(`\n📋 Existing .env backed up to: ${backupPath}`);
  }

  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ Environment variables saved to .env file!\n');
  console.log('📝 Important: Keep your .env file secure and never commit it to version control!\n');
  console.log('🎉 Setup complete! You can now start your server with: npm run dev\n');

  rl.close();
}

// Run setup
setupEnvironment().catch(error => {
  console.error('Setup failed:', error);
  rl.close();
  process.exit(1);
});
