import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qrcode-app');
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkAllCards = async () => {
  await connectDB();

  try {
    const { default: User } = await import('../models/User.js');
    const { default: QRCode } = await import('../models/QRCode.js');
    const { default: Alert } = await import('../models/Alert.js');

    console.log('\n🔍 Looking for user: vineetsahoo3@gmail.com');
    const user = await User.findOne({ email: 'vineetsahoo3@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found!');
      process.exit(1);
    }
    
    console.log('✅ User found:', user.name);

    const qrCodes = await QRCode.find({ userId: user._id, isActive: true }).sort({ createdAt: -1 });
    
    console.log(`\n📦 Found ${qrCodes.length} active cards/passes:\n`);

    const now = new Date();
    let alertsToCreate = 0;

    for (const qr of qrCodes) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📄 Title: ${qr.title}`);
      console.log(`🆔 ID: ${qr._id}`);
      console.log(`📂 Type: ${qr.qrType}`);
      console.log(`🏷️  Category: ${qr.category}`);
      console.log(`📅 Created: ${qr.createdAt.toLocaleString()}`);

      // Parse data
      let parsedData = qr.data;
      if (qr.data && typeof qr.data === 'object') {
        if (qr.data.text && typeof qr.data.text === 'string') {
          try {
            parsedData = JSON.parse(qr.data.text);
            console.log(`📝 Parsed Data:`, JSON.stringify(parsedData, null, 2));
          } catch (e) {
            console.log(`📝 Raw Data:`, JSON.stringify(qr.data, null, 2));
          }
        } else {
          console.log(`📝 Data:`, JSON.stringify(qr.data, null, 2));
        }
      }

      // Check for expiry
      let expiryDate = null;
      if (parsedData.expiry) {
        const expiryParts = parsedData.expiry.split('/');
        if (expiryParts.length === 2) {
          const month = parseInt(expiryParts[0], 10);
          const year = parseInt('20' + expiryParts[1], 10);
          expiryDate = new Date(year, month, 0);
        }
      }

      if (expiryDate) {
        const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
        console.log(`📅 Expiry: ${expiryDate.toLocaleDateString()}`);
        console.log(`⏱️  Days until expiry: ${daysUntilExpiry}`);
        
        if (daysUntilExpiry <= 0) {
          console.log(`🔴 STATUS: EXPIRED ${Math.abs(daysUntilExpiry)} days ago`);
          
          // Check if alert exists
          const existingAlert = await Alert.findOne({
            userId: user._id,
            relatedTo: 'qrcode',
            relatedId: qr._id,
            isResolved: false
          });

          if (!existingAlert) {
            console.log(`⚠️  NO ALERT EXISTS - Will be created automatically`);
            alertsToCreate++;
          } else {
            console.log(`✅ Alert exists:`, existingAlert.title);
          }
        } else if (daysUntilExpiry <= 30) {
          console.log(`⏰ STATUS: Expiring in ${daysUntilExpiry} days`);
          
          const existingAlert = await Alert.findOne({
            userId: user._id,
            relatedTo: 'qrcode',
            relatedId: qr._id,
            isResolved: false
          });

          if (!existingAlert) {
            console.log(`⚠️  NO ALERT EXISTS - Will be created automatically`);
            alertsToCreate++;
          } else {
            console.log(`✅ Alert exists:`, existingAlert.title);
          }
        } else {
          console.log(`✅ STATUS: Valid (expires in ${daysUntilExpiry} days)`);
        }
      } else {
        console.log(`⚠️  No expiry date found`);
      }
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`\n📊 Summary:`);
    console.log(`Total cards/passes: ${qrCodes.length}`);
    console.log(`Alerts to be created: ${alertsToCreate}`);
    console.log(`\n💡 These alerts will be created automatically when you visit the Alerts page!`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
};

checkAllCards();
