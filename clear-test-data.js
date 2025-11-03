/**
 * Script to clear old test QR codes from database
 * Run this if you want to start fresh with new cards/passes that have QR images
 * 
 * Usage: node clear-test-data.js
 */

import mongoose from 'mongoose';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const MONGODB_URI = 'mongodb://localhost:27017/passvault';

async function clearTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get QRCode model
    const QRCode = mongoose.model('QRCode', new mongoose.Schema({}, { strict: false }));

    // Count existing QR codes
    const count = await QRCode.countDocuments();
    console.log(`\n📊 Found ${count} QR codes in database`);

    if (count === 0) {
      console.log('✨ Database is already clean!');
      await mongoose.disconnect();
      rl.close();
      return;
    }

    // Ask for confirmation
    rl.question(`\n⚠️  WARNING: This will delete ALL ${count} QR codes (cards and passes)!\n\nAre you sure? (yes/no): `, async (answer) => {
      if (answer.toLowerCase() === 'yes') {
        const result = await QRCode.deleteMany({});
        console.log(`\n✅ Deleted ${result.deletedCount} QR codes`);
        console.log('✨ Database cleared! You can now create fresh cards with QR images.');
      } else {
        console.log('\n❌ Operation cancelled. No data was deleted.');
      }

      await mongoose.disconnect();
      console.log('👋 Disconnected from MongoDB');
      rl.close();
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    rl.close();
    process.exit(1);
  }
}

clearTestData();
