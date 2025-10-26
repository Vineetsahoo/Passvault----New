import mongoose from 'mongoose';
import User from './models/User.js';

mongoose.connect('mongodb://localhost:27017/passvault')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Search for user by email
    const email = 'vineetsahoo3@gmail.com';
    const user = await User.findOne({ email: email });
    
    if (user) {
      console.log('\n=== User Found ===');
      console.log('ID:', user._id);
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Email Verified:', user.isEmailVerified);
      console.log('Account Locked:', user.isLocked);
      console.log('Login Attempts:', user.loginAttempts);
      console.log('Created At:', user.createdAt);
      console.log('Last Login:', user.lastLogin);
    } else {
      console.log('\n❌ User NOT found with email:', email);
      
      // Show all users
      const allUsers = await User.find({}).select('name email createdAt').lean();
      console.log('\nAll users in database:', allUsers.length);
      allUsers.forEach((u, index) => {
        console.log(`${index + 1}. ${u.name} - ${u.email}`);
      });
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
