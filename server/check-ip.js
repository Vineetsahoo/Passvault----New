#!/usr/bin/env node

import os from 'os';
import chalk from 'chalk';

console.log(chalk.cyan.bold('\n╔═══════════════════════════════════════════╗'));
console.log(chalk.cyan.bold('║     NETWORK IP ADDRESS CHECKER           ║'));
console.log(chalk.cyan.bold('╚═══════════════════════════════════════════╝\n'));

const networkInterfaces = os.networkInterfaces();

console.log(chalk.yellow.bold('📡 Your Network Addresses:\n'));

let foundIP = false;

Object.keys(networkInterfaces).forEach(interfaceName => {
  const interfaces = networkInterfaces[interfaceName];
  
  if (interfaces) {
    interfaces.forEach(iface => {
      if (iface.family === 'IPv4') {
        const isInternal = iface.internal;
        const icon = isInternal ? '🔒' : '🌐';
        const label = isInternal ? '(Localhost)' : '(Local Network) ← USE THIS';
        const color = isInternal ? 'gray' : 'green';
        
        console.log(chalk[color](`${icon} ${interfaceName}: ${chalk.bold(iface.address)} ${label}`));
        
        if (!isInternal) {
          foundIP = true;
        }
      }
    });
  }
});

console.log('');

if (foundIP) {
  console.log(chalk.green.bold('✅ Found your local network IP!'));
  console.log(chalk.white('\n📱 To use Terminal QR Scanner:'));
  console.log(chalk.white('1. Make sure your phone is on the SAME WiFi network'));
  console.log(chalk.white('2. Run: npm run generate-qr'));
  console.log(chalk.white('3. The QR code will use your local IP automatically'));
  console.log(chalk.white('4. Scan with your phone camera\n'));
} else {
  console.log(chalk.yellow.bold('⚠️  No local network IP found!'));
  console.log(chalk.white('\n🔧 Troubleshooting:'));
  console.log(chalk.white('1. Make sure you\'re connected to WiFi'));
  console.log(chalk.white('2. Check your network adapter is enabled'));
  console.log(chalk.white('3. Try connecting your phone to the same WiFi network\n'));
}

console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
