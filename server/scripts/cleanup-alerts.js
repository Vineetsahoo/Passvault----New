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

const cleanupAlerts = async () => {
  await connectDB();

  try {
    const { default: Alert } = await import('../models/Alert.js');

    console.log('\n🧹 Cleaning up old expiration alerts...');
    
    const result = await Alert.deleteMany({
      alertType: { $in: ['card_expiry', 'pass_expiry'] }
    });

    console.log(`✅ Deleted ${result.deletedCount} old expiration alerts`);
    console.log('\n💡 New alerts with proper metadata will be created automatically when you visit the Alerts page!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
};

cleanupAlerts();
