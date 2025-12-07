const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const config = require('./config/environment');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    let admin = await User.findOne({ email: 'admin@mazadzoo.com' });
    
    if (admin) {
      console.log('Admin user already exists:');
      console.log('Email: admin@mazadzoo.com');
      console.log('Password: admin123');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    admin = await User.create({
      username: 'مشرف النظام',
      email: 'admin@mazadzoo.com',
      phoneNumber: '+218911111111',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      isActive: true
    });

    console.log('Admin user created successfully!');
    console.log('Login credentials:');
    console.log('Email: admin@mazadzoo.com');
    console.log('Password: admin123');
    console.log('');
    console.log('You can now login to the admin dashboard at: http://localhost:5174');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the function
createAdminUser();