import mongoose from 'mongoose';
import User from './models/User.js';

mongoose.connect('mongodb://localhost:27017/passvault')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Create user
    const userData = {
      name: 'Vineet Sahoo',
      email: 'vineetsahoo3@gmail.com',
      password: 'Vineet@123', // Change this to your desired password
      isEmailVerified: true
    };
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    
    if (existingUser) {
      console.log('\n⚠️  User already exists!');
      console.log('Email:', existingUser.email);
      console.log('Name:', existingUser.name);
    } else {
      const user = new User(userData);
      await user.save();
      
      console.log('\n✅ User created successfully!');
      console.log('Email:', user.email);
      console.log('Name:', user.name);
      console.log('Password:', userData.password);
      console.log('\nYou can now login with these credentials.');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
