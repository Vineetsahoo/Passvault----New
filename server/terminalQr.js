#!/usr/bin/env node

import qrcode from 'qrcode-terminal';
import axios from 'axios';
import readline from 'readline';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = process.env.API_URL || 'http://localhost:5000';

// Token cache file path
const TOKEN_CACHE_FILE = path.join(__dirname, '.qr-token-cache.json');

// Load cached token
function loadCachedToken() {
  try {
    if (fs.existsSync(TOKEN_CACHE_FILE)) {
      const cache = JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, 'utf8'));
      // Check if token is still valid (not expired)
      if (cache.token && cache.expiresAt && cache.expiresAt > Date.now()) {
        console.log(chalk.green('✅ Using cached authentication\n'));
        return cache.token;
      }
    }
  } catch (error) {
    console.log(chalk.yellow('⚠️ Could not load cached token'));
  }
  return null;
}

// Save token to cache
function saveCachedToken(token) {
  try {
    const cache = {
      token,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify(cache), 'utf8');
  } catch (error) {
    console.log(chalk.yellow('⚠️ Could not save token to cache'));
  }
}

// Sample pass templates
const PASS_TEMPLATES = {
  'boarding-pass': {
    title: 'Flight to NYC',
    airline: 'Sky Airlines',
    from: 'LAX',
    to: 'JFK',
    flight: 'SA123',
    seat: '12A',
    gate: 'B7',
    boarding: '10:30 AM',
    departure: '11:00 AM',
    date: new Date().toISOString().split('T')[0],
    passenger: 'John Doe',
    class: 'Economy'
  },
  'event-ticket': {
    title: 'Concert Ticket',
    event: 'Summer Music Festival',
    venue: 'Madison Square Garden',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '7:00 PM',
    section: 'A',
    row: '12',
    seat: '5',
    price: '$150.00',
    ticketNumber: 'TKT-' + Math.random().toString(36).substr(2, 9).toUpperCase()
  },
  'loyalty-card': {
    title: 'VIP Membership',
    program: 'Gold Member',
    memberNumber: 'GOLD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    memberSince: '2024',
    points: Math.floor(Math.random() * 5000) + 1000,
    tier: 'Gold',
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  'parking-pass': {
    title: 'Parking Pass',
    location: 'Downtown Parking Garage',
    level: 'Level 3',
    spot: 'A-45',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    vehicle: 'Toyota Camry',
    plate: 'ABC-' + Math.floor(Math.random() * 9000 + 1000),
    passNumber: 'PARK-' + Math.random().toString(36).substr(2, 9).toUpperCase()
  },
  'gym-membership': {
    title: 'Gym Membership',
    gym: 'FitLife Fitness Center',
    memberName: 'John Doe',
    membershipType: 'Premium',
    memberNumber: 'GYM-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    facilities: 'All Access'
  }
};

// Display banner
function displayBanner() {
  console.clear();
  console.log(chalk.cyan.bold('\n╔═══════════════════════════════════════════╗'));
  console.log(chalk.cyan.bold('║   🎫  TERMINAL QR CODE GENERATOR  🎫     ║'));
  console.log(chalk.cyan.bold('╚═══════════════════════════════════════════╝\n'));
}

// Display menu
function displayMenu() {
  console.log(chalk.yellow.bold('\n📋 Select Pass Type:\n'));
  console.log(chalk.white('1) ✈️  Boarding Pass'));
  console.log(chalk.white('2) 🎟️  Event Ticket'));
  console.log(chalk.white('3) 💳 Loyalty Card'));
  console.log(chalk.white('4) 🅿️  Parking Pass'));
  console.log(chalk.white('5) 💪 Gym Membership'));
  console.log(chalk.white('0) ❌ Exit\n'));
}

// Get user input
function getUserInput(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Get JWT token
async function getAuthToken() {
  // First, try to load cached token
  const cachedToken = loadCachedToken();
  if (cachedToken) {
    // Verify token is still valid by making a test request
    try {
      await axios.get(`${API_URL}/api/terminal-qr/sessions`, {
        headers: { 'Authorization': `Bearer ${cachedToken}` }
      });
      return cachedToken;
    } catch (error) {
      console.log(chalk.yellow('⚠️ Cached token expired, please login again\n'));
    }
  }

  console.log(chalk.yellow('\n🔐 Authentication Required\n'));
  
  const email = await getUserInput(chalk.white('Enter your email: '));
  const password = await getUserInput(chalk.white('Enter your password: '));

  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password
    });

    // Handle both response formats: { token } or { success, token } or { success, data: { token } }
    const token = response.data.token || response.data.data?.token || response.data.data?.accessToken;
    
    if (token) {
      console.log(chalk.green('\n✅ Authenticated successfully!\n'));
      saveCachedToken(token);
      return token;
    } else {
      console.log(chalk.red('\n❌ Authentication failed: No token received'));
      console.log(chalk.gray('Response:', JSON.stringify(response.data, null, 2)));
      return null;
    }
  } catch (error) {
    console.log(chalk.red('\n❌ Authentication error:', error.response?.data?.message || error.message));
    if (error.response?.data) {
      console.log(chalk.gray('Response data:', JSON.stringify(error.response.data, null, 2)));
    }
    return null;
  }
}

// Generate QR session
async function generateQRSession(token, passType, passData) {
  try {
    const response = await axios.post(
      `${API_URL}/api/terminal-qr/generate`,
      {
        passType,
        passData,
        expirySeconds: 60
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data.data;
  } catch (error) {
    console.log(chalk.red('❌ Failed to generate QR session:', error.response?.data?.message || error.message));
    return null;
  }
}

// Poll session status
async function pollSessionStatus(token, sessionId, interval = 2000) {
  return setInterval(async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/terminal-qr/status/${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.data.scanned) {
        console.log(chalk.green.bold('\n\n✅ QR CODE SCANNED SUCCESSFULLY! ✅'));
        console.log(chalk.green('🎉 Pass created and added to your account!\n'));
        process.exit(0);
      }
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 410) {
        console.log(chalk.red('\n❌ Session expired or not found'));
        process.exit(1);
      }
    }
  }, interval);
}

// Display QR code with countdown
function displayQRWithCountdown(qrData, expiresAt, sessionId) {
  console.log(chalk.cyan.bold('\n╔═══════════════════════════════════════════╗'));
  console.log(chalk.cyan.bold('║          SCAN QR CODE WITH PHONE          ║'));
  console.log(chalk.cyan.bold('╚═══════════════════════════════════════════╝\n'));

  // Generate and display QR code
  qrcode.generate(qrData, { small: true });

  // Extract and display the URL for manual access
  console.log(chalk.cyan.bold('\n� Scan URL:'));
  console.log(chalk.white(qrData));
  console.log(chalk.gray('\n(You can also copy this URL to your phone browser)\n'));

  console.log(chalk.yellow.bold('📱 How to Scan:'));
  console.log(chalk.white(''));
  console.log(chalk.white('Option 1 - Native Camera (Recommended):'));
  console.log(chalk.white('  • Open your phone\'s Camera app (not Google Lens)'));
  console.log(chalk.white('  • Point at the QR code above'));
  console.log(chalk.white('  • Tap the notification/banner that appears'));
  console.log(chalk.white(''));
  console.log(chalk.white('Option 2 - Manual URL:'));
  console.log(chalk.white('  • Copy the URL above'));
  console.log(chalk.white('  • Paste in your phone\'s browser'));
  console.log(chalk.white(''));
  console.log(chalk.white('Option 3 - QR Scanner App:'));
  console.log(chalk.white('  • Use any QR scanner app (NOT Google Lens)'));
  console.log(chalk.white('  • Scan and open the URL'));
  console.log(chalk.white(''));
  
  console.log(chalk.bgYellow.black(' ⚠️  IMPORTANT: Phone must be on same WiFi as computer! '));
  console.log(chalk.white(''));

  console.log(chalk.gray(`Session ID: ${sessionId}\n`));

  // Countdown timer
  const countdownInterval = setInterval(() => {
    const now = Date.now();
    const timeLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));

    if (timeLeft === 0) {
      clearInterval(countdownInterval);
      console.log(chalk.red('\n❌ QR CODE EXPIRED'));
      console.log(chalk.yellow('Please generate a new QR code\n'));
      process.exit(1);
    }

    // Display countdown
    readline.cursorTo(process.stdout, 0);
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (timeLeft <= 10) {
      process.stdout.write(chalk.red.bold(`⏱️  Time remaining: ${timeStr} `));
    } else if (timeLeft <= 30) {
      process.stdout.write(chalk.yellow.bold(`⏱️  Time remaining: ${timeStr} `));
    } else {
      process.stdout.write(chalk.green.bold(`⏱️  Time remaining: ${timeStr} `));
    }
  }, 1000);

  return countdownInterval;
}

// Main function
async function main() {
  displayBanner();

  // Get authentication token
  const token = await getAuthToken();
  if (!token) {
    console.log(chalk.red('Authentication required. Exiting...\n'));
    process.exit(1);
  }

  while (true) {
    displayBanner();
    displayMenu();

    const choice = await getUserInput(chalk.cyan('Enter your choice (0-5): '));

    if (choice === '0') {
      console.log(chalk.yellow('\n👋 Goodbye!\n'));
      process.exit(0);
    }

    let passType;
    let passTemplate;

    switch (choice) {
      case '1':
        passType = 'boarding-pass';
        passTemplate = PASS_TEMPLATES['boarding-pass'];
        break;
      case '2':
        passType = 'event-ticket';
        passTemplate = PASS_TEMPLATES['event-ticket'];
        break;
      case '3':
        passType = 'loyalty-card';
        passTemplate = PASS_TEMPLATES['loyalty-card'];
        break;
      case '4':
        passType = 'parking-pass';
        passTemplate = PASS_TEMPLATES['parking-pass'];
        break;
      case '5':
        passType = 'gym-membership';
        passTemplate = PASS_TEMPLATES['gym-membership'];
        break;
      default:
        console.log(chalk.red('\n❌ Invalid choice. Please try again.\n'));
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
    }

    console.log(chalk.green(`\n✅ Generating ${passType.replace('-', ' ')}...\n`));

    // Generate QR session
    const session = await generateQRSession(token, passType, passTemplate);
    
    if (!session) {
      console.log(chalk.red('Failed to generate QR session. Please try again.\n'));
      await new Promise(resolve => setTimeout(resolve, 2000));
      continue;
    }

    // Display pass details
    console.log(chalk.cyan.bold('\n📄 Pass Details:\n'));
    Object.entries(passTemplate).forEach(([key, value]) => {
      console.log(chalk.white(`   ${key}: ${chalk.yellow(value)}`));
    });

    // Display QR code with countdown
    const countdownInterval = displayQRWithCountdown(
      session.qrData,
      session.expiresAt,
      session.sessionId
    );

    // Start polling for scan status
    const pollInterval = pollSessionStatus(token, session.sessionId);

    // Handle Ctrl+C
    process.on('SIGINT', () => {
      clearInterval(countdownInterval);
      clearInterval(pollInterval);
      console.log(chalk.yellow('\n\n👋 Cancelled. Goodbye!\n'));
      process.exit(0);
    });

    // Wait indefinitely (until scanned or expired)
    await new Promise(() => {});
  }
}

// Run the program
main().catch(error => {
  console.error(chalk.red('\n❌ Unexpected error:'), error.message);
  process.exit(1);
});
