const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const config = require('./config/environment');

const createAdmin = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@mazadzoo.com';
    let admin = await User.findOne({ email });
    if (admin) {
      console.log('Admin already exists:', email);
      return process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 12);
    admin = await User.create({
      username: 'admin_user',
      email,
      phoneNumber: '+218911111113',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      isActive: true
    });

    console.log('Admin created:', admin.email);
  } catch (err) {
    console.error('Error creating admin:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

createAdmin();
