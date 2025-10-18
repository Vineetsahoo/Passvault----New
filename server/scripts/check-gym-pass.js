import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import models dynamically
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qrcode-app');
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkGymPass = async () => {
  await connectDB();

  try {
    // Import models
    const { default: User } = await import('../models/User.js');
    const { default: QRCode } = await import('../models/QRCode.js');
    const { default: Alert } = await import('../models/Alert.js');

    // Find user by email
    console.log('\n🔍 Looking for user: vineetsahoo3@gmail.com');
    const user = await User.findOne({ email: 'vineetsahoo3@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found!');
      process.exit(1);
    }
    
    console.log('✅ User found:', {
      id: user._id,
      name: user.name,
      email: user.email
    });

    // Find all QR codes for this user
    console.log('\n🔍 Looking for QR codes/cards...');
    const qrCodes = await QRCode.find({ userId: user._id, isActive: true });
    
    console.log(`\n📦 Found ${qrCodes.length} active QR codes:`);
    qrCodes.forEach((qr, index) => {
      console.log(`\n${index + 1}. ${qr.title}`);
      console.log('   ID:', qr._id);
      console.log('   Type:', qr.qrType);
      console.log('   Category:', qr.category);
      console.log('   Data:', JSON.stringify(qr.data, null, 2));
      console.log('   ExpiresAt:', qr.expiresAt);
      console.log('   Created:', qr.createdAt);
    });

    // Find Gym Membership Pass specifically
    const gymPass = qrCodes.find(qr => 
      qr.title.toLowerCase().includes('gym') && 
      qr.title.toLowerCase().includes('membership')
    );

    if (!gymPass) {
      console.log('\n❌ Gym Membership Pass not found!');
      console.log('Available titles:', qrCodes.map(qr => qr.title));
      process.exit(1);
    }

    console.log('\n✅ Gym Membership Pass found!');
    console.log('Title:', gymPass.title);
    console.log('Data:', JSON.stringify(gymPass.data, null, 2));

    // Parse expiry date with better logic
    let expiryDate = null;
    if (gymPass.data && typeof gymPass.data === 'object') {
      // First check if there's a 'text' field with JSON string
      let parsedData = gymPass.data;
      if (gymPass.data.text && typeof gymPass.data.text === 'string') {
        try {
          parsedData = JSON.parse(gymPass.data.text);
          console.log('\n📝 Parsed text data:', JSON.stringify(parsedData, null, 2));
        } catch (e) {
          console.warn('⚠️  Failed to parse text field');
          parsedData = gymPass.data;
        }
      }

      // Check for expiry in parsed data
      if (parsedData.expiry) {
        const expiryParts = parsedData.expiry.split('/');
        if (expiryParts.length === 2) {
          const month = parseInt(expiryParts[0], 10);
          const year = parseInt('20' + expiryParts[1], 10);
          expiryDate = new Date(year, month, 0);
        }
      } else if (gymPass.data.expiry) {
        // Fallback to direct data.expiry
        const expiryParts = gymPass.data.expiry.split('/');
        if (expiryParts.length === 2) {
          const month = parseInt(expiryParts[0], 10);
          const year = parseInt('20' + expiryParts[1], 10);
          expiryDate = new Date(year, month, 0);
        }
      }
    }

    if (!expiryDate && gymPass.expiresAt) {
      expiryDate = new Date(gymPass.expiresAt);
    }

    console.log('\n📅 Expiry Information:');
    console.log('Expiry Date:', expiryDate ? expiryDate.toLocaleDateString() : 'Not found');
    
    if (expiryDate) {
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
      console.log('Days until expiry:', daysUntilExpiry);
      console.log('Status:', daysUntilExpiry <= 0 ? '🔴 EXPIRED' : '⏰ Valid');
    }

    // Check existing alerts
    console.log('\n🔔 Checking existing alerts...');
    const existingAlerts = await Alert.find({
      userId: user._id,
      relatedTo: 'qrcode',
      relatedId: gymPass._id
    });

    console.log(`Found ${existingAlerts.length} existing alerts for this pass`);
    existingAlerts.forEach((alert, index) => {
      console.log(`\n${index + 1}. ${alert.title}`);
      console.log('   Severity:', alert.severity);
      console.log('   Resolved:', alert.isResolved);
      console.log('   Message:', alert.message);
      console.log('   Created:', alert.createdAt);
    });

    // Create alert if expired and no unresolved alert exists
    if (expiryDate) {
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

      const unresolvedAlert = existingAlerts.find(a => !a.isResolved);
      
      if (!unresolvedAlert && daysUntilExpiry <= 0) {
        console.log('\n🔨 Creating new alert...');
        
        const daysAgo = Math.abs(daysUntilExpiry);
        const alert = new Alert({
          userId: user._id,
          alertType: 'pass_expiry',
          severity: 'critical',
          title: `🎫 ${gymPass.title} EXPIRED`,
          message: `Your pass "${gymPass.title}" expired ${daysAgo === 0 ? 'today' : `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`} on ${expiryDate.toLocaleDateString()}. Immediate renewal required!`,
          relatedTo: 'qrcode',
          relatedId: gymPass._id,
          actionRequired: true,
          actionUrl: `/features/qr-scan`,
          actionLabel: 'Renew Now',
          expiryDate: expiryDate,
          metadata: {
            cardType: 'membership',
            isCard: false,
            qrTitle: gymPass.title,
            daysUntilExpiry
          }
        });

        await alert.save();
        console.log('✅ Alert created successfully!');
        console.log('Alert ID:', alert._id);
      } else if (unresolvedAlert) {
        console.log('\n⚠️  Unresolved alert already exists, skipping creation');
      } else {
        console.log('\n⚠️  Pass not expired yet, no alert needed');
      }
    }

    // Get all alerts for user
    console.log('\n📊 All alerts for user:');
    const allAlerts = await Alert.find({ userId: user._id, isResolved: false });
    console.log(`Total unresolved alerts: ${allAlerts.length}`);
    allAlerts.forEach((alert, index) => {
      console.log(`\n${index + 1}. ${alert.title}`);
      console.log('   Type:', alert.alertType);
      console.log('   Severity:', alert.severity);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
};

checkGymPass();
