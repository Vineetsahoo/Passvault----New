import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

console.log('\n🔍 Testing Database Connection...\n');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/passvault';

console.log(`📍 Connecting to: ${mongoURI.replace(/\/\/.*:.*@/, '//***:***@')}\n`);

async function testConnection() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    
    console.log('✅ Successfully connected to MongoDB!\n');

    // Get database info
    const db = mongoose.connection.db;
    const admin = db.admin();
    
    // Get server info
    const serverInfo = await admin.serverInfo();
    console.log('📊 MongoDB Server Info:');
    console.log(`   Version: ${serverInfo.version}`);
    console.log(`   Storage Engine: ${serverInfo.storageEngine?.name || 'N/A'}\n`);

    // Get database stats
    const stats = await db.stats();
    console.log('📈 Database Stats:');
    console.log(`   Database: ${stats.db}`);
    console.log(`   Collections: ${stats.collections}`);
    console.log(`   Documents: ${stats.objects}`);
    console.log(`   Data Size: ${(stats.dataSize / 1024).toFixed(2)} KB`);
    console.log(`   Storage Size: ${(stats.storageSize / 1024).toFixed(2)} KB\n`);

    // List collections
    const collections = await db.listCollections().toArray();
    if (collections.length > 0) {
      console.log('📚 Existing Collections:');
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
      console.log('');
    } else {
      console.log('📚 No collections yet (this is normal for a new database)\n');
    }

    // Test write operation
    console.log('✍️  Testing write operation...');
    const testCollection = db.collection('connection_test');
    await testCollection.insertOne({
      test: true,
      timestamp: new Date(),
      message: 'Connection test successful'
    });
    console.log('✅ Write operation successful!\n');

    // Test read operation
    console.log('📖 Testing read operation...');
    const doc = await testCollection.findOne({ test: true });
    console.log('✅ Read operation successful!\n');

    // Clean up test document
    await testCollection.deleteOne({ test: true });
    console.log('🧹 Cleaned up test data\n');

    console.log('🎉 All database tests passed!\n');
    console.log('✨ Your database is ready to use!\n');

  } catch (error) {
    console.error('❌ Database connection failed!\n');
    console.error('Error details:', error.message);
    console.error('\n💡 Troubleshooting tips:');
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('   - MongoDB server is not running');
      console.error('   - Start MongoDB with: net start MongoDB (Windows)');
      console.error('   - Or install MongoDB from: https://www.mongodb.com/try/download/community');
    } else if (error.message.includes('authentication failed')) {
      console.error('   - Check your MongoDB username and password');
      console.error('   - Verify credentials in .env file');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
      console.error('   - Check your internet connection (for MongoDB Atlas)');
      console.error('   - Verify MongoDB URI in .env file');
      console.error('   - Check if IP is whitelisted in MongoDB Atlas');
    } else {
      console.error('   - Check if MONGODB_URI in .env file is correct');
      console.error('   - Verify MongoDB is installed and running');
      console.error('   - Check firewall settings');
    }
    console.error('\n');
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the test
testConnection();
