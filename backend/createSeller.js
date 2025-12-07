const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const config = require('./config/environment');

const createSeller = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'seller1@example.com';
    let seller = await User.findOne({ email });
    if (seller) {
      console.log('Seller already exists:', email);
      return process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('SellerPass1', 12);
    seller = await User.create({
      username: 'seller1',
      email,
      phoneNumber: '+218912222222',
      password: hashedPassword,
      role: 'seller',
      isVerified: true,
      isActive: true
    });

    console.log('Seller created:', seller.email);
  } catch (err) {
    console.error('Error creating seller:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

createSeller();
