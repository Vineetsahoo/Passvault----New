import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/passvault';

async function testAlertCheck() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Alert = (await import('../models/Alert.js')).default;
    const QRCode = (await import('../models/QRCode.js')).default;

    console.log('🔍 Testing alert checking logic...\n');

    // Find user Vineet
    const userId = '68f1e62ec60a88be48e55d0b';
    console.log('👤 User ID:', userId, '\n');

    // Get all QR codes
    const qrCodes = await QRCode.find({ userId, isActive: true });
    console.log(`📦 Found ${qrCodes.length} active QR codes/cards\n`);

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    for (const qr of qrCodes) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📋 Card: ${qr.title}`);
      console.log(`   Type: ${qr.qrType}`);
      console.log(`   Category: ${qr.category || 'N/A'}`);

      let expiryDate = null;
      let cardType = 'item';
      let parsedData = {}; // Initialize outside if block
      let expiryFormatted = null;

      if (qr.data && typeof qr.data === 'object') {
        parsedData = qr.data;
        if (qr.data.text && typeof qr.data.text === 'string') {
          try {
            parsedData = JSON.parse(qr.data.text);
            console.log('   📝 Parsed text data:', parsedData);
          } catch (e) {
            console.log('   ⚠️  Failed to parse text field');
            parsedData = qr.data;
          }
        }

        if (parsedData.expiry) {
          expiryFormatted = parsedData.expiry;
          const expiryParts = parsedData.expiry.split('/');
          if (expiryParts.length === 2) {
            const month = parseInt(expiryParts[0], 10);
            const year = parseInt('20' + expiryParts[1], 10);
            expiryDate = new Date(year, month, 0);
            console.log(`   📅 Expiry from data: ${parsedData.expiry} → ${expiryDate.toLocaleDateString()}`);
          }
        } else if (qr.data.expiry) {
          expiryFormatted = qr.data.expiry;
          const expiryParts = qr.data.expiry.split('/');
          if (expiryParts.length === 2) {
            const month = parseInt(expiryParts[0], 10);
            const year = parseInt('20' + expiryParts[1], 10);
            expiryDate = new Date(year, month, 0);
            console.log(`   📅 Expiry from data.expiry: ${qr.data.expiry} → ${expiryDate.toLocaleDateString()}`);
          }
        }

        if (parsedData.type) {
          cardType = parsedData.type.toLowerCase();
        } else if (qr.data.type) {
          cardType = qr.data.type.toLowerCase();
        } else if (qr.category) {
          cardType = qr.category.toLowerCase();
        } else if (qr.qrType) {
          cardType = qr.qrType.toLowerCase();
        }
      }

      if (!expiryDate && qr.expiresAt) {
        expiryDate = new Date(qr.expiresAt);
        console.log(`   📅 Expiry from expiresAt: ${expiryDate.toLocaleDateString()}`);
      }

      console.log(`   🏷️  Card Type: ${cardType}`);
      console.log(`   📅 Expiry Formatted: ${expiryFormatted || 'N/A'}`);

      if (expiryDate) {
        const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
        console.log(`   ⏱️  Days until expiry: ${daysUntilExpiry}`);

        if (expiryDate <= thirtyDaysFromNow) {
          const isCard = ['credit', 'debit'].includes(cardType);
          const alertType = isCard ? 'card_expiry' : 'pass_expiry';
          
          let severity = 'low';
          if (daysUntilExpiry <= 0) {
            severity = 'critical';
          } else if (daysUntilExpiry <= 7) {
            severity = 'high';
          } else if (daysUntilExpiry <= 14) {
            severity = 'medium';
          }

          console.log(`   🚨 Alert should be created:`);
          console.log(`      - Alert Type: ${alertType}`);
          console.log(`      - Severity: ${severity}`);
          console.log(`      - Status: ${daysUntilExpiry <= 0 ? 'EXPIRED' : 'EXPIRING SOON'}`);
          
          // Check if alert exists
          const existingAlert = await Alert.findOne({
            userId: userId,
            relatedTo: 'qrcode',
            relatedId: qr._id,
            isResolved: false
          });

          if (existingAlert) {
            console.log(`      ✅ Alert exists in database`);
            console.log(`         - Title: ${existingAlert.title}`);
            console.log(`         - Metadata expiryFormatted: ${existingAlert.metadata?.expiryFormatted || 'N/A'}`);
            console.log(`         - Metadata category: ${existingAlert.metadata?.category || 'N/A'}`);
          } else {
            console.log(`      ⚠️  Alert does NOT exist in database`);
          }
        } else {
          console.log(`   ℹ️  Not expiring within 30 days - no alert needed`);
        }
      } else {
        console.log(`   ℹ️  No expiry date found - no alert will be created`);
      }
    }

    console.log(`\n${'='.repeat(60)}\n`);
    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testAlertCheck();
