import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const checkUser = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/passvault');
    console.log('Connected to MongoDB');
    
    const email = 'singhsaumye2004@gmail.com';
    const user = await User.findOne({ email });
    
    if (user) {
      console.log('\n✅ User EXISTS in database:');
      console.log('   Email:', user.email);
      console.log('   Name:', user.name);
      console.log('   Created:', user.createdAt);
      console.log('\n💡 You can login with this email and your password.');
    } else {
      console.log('\n❌ User NOT FOUND in database');
      console.log('   Email searched:', email);
      console.log('\n💡 Please REGISTER first at http://localhost:5173');
      console.log('   Or use the registration API endpoint.');
    }
    
    // Show all users in database
    const allUsers = await User.find({}).select('email name createdAt');
    console.log('\n📋 All users in database:');
    if (allUsers.length === 0) {
      console.log('   (No users found - database is empty)');
    } else {
      allUsers.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.email} - ${u.name}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

checkUser();
