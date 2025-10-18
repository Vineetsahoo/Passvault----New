import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

console.log('\n🌱 Database Seeding Script\n');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/passvault';

const testUsers = [
  {
    name: 'Rahul Singh',
    email: 'rahulsingh05@gmail.com',
    password: 'Rahul05@',
    isEmailVerified: true,
    subscription: { plan: 'free', isActive: true }
  },
  {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Test123!@#',
    isEmailVerified: true,
    subscription: { plan: 'free', isActive: true }
  },
  {
    name: 'Demo Admin',
    email: 'admin@passvault.com',
    password: 'Admin123!@#',
    isEmailVerified: true,
    subscription: { plan: 'premium', isActive: true }
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to database...\n');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB!\n');

    // Clear existing users (optional)
    console.log('🗑️  Clearing existing users...');
    const deleteResult = await User.deleteMany({});
    console.log(`   Deleted ${deleteResult.deletedCount} users\n`);

    // Create test users
    console.log('👥 Creating test users...\n');
    
    for (const userData of testUsers) {
      try {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created user: ${userData.email}`);
        console.log(`   Name: ${userData.name}`);
        console.log(`   Password: ${userData.password}`);
        console.log(`   Plan: ${userData.subscription.plan}\n`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️  User already exists: ${userData.email}\n`);
        } else {
          console.error(`❌ Failed to create user ${userData.email}:`, error.message, '\n');
        }
      }
    }

    // Get final user count
    const userCount = await User.countDocuments();
    console.log(`\n📊 Total users in database: ${userCount}`);

    console.log('\n🎉 Database seeding completed!\n');
    console.log('🔑 Test Credentials:\n');
    testUsers.forEach(user => {
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}\n`);
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed\n');
  }
}

// Run the seeder
seedDatabase();
