const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = 'mongodb+srv://m82basheer2:JFdfY.N2S9MZZBn@animal.uxhyyex.mongodb.net/?appName=animal';

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Create fresh test users
    await User.deleteMany({ email: /^test(seller|buyer|admin)@/ });
    
    const seller = await User.create({
      username: 'testseller',
      email: 'testseller@example.com',
      phoneNumber: '+218912111111',
      password: 'TestPass123!',
      role: 'seller',
      isVerified: true,
      isActive: true
    });
    console.log(`✅ Created seller: ${seller._id} (${seller.email})`);

    const buyer = await User.create({
      username: 'testbuyer',
      email: 'testbuyer@example.com',
      phoneNumber: '+218912111112',
      password: 'TestPass123!',
      role: 'buyer',
      isVerified: true,
      isActive: true
    });
    console.log(`✅ Created buyer: ${buyer._id} (${buyer.email})`);

    const admin = await User.create({
      username: 'testadmin',
      email: 'testadmin@example.com',
      phoneNumber: '+218912111113',
      password: 'TestPass123!',
      role: 'admin',
      isVerified: true,
      isActive: true
    });
    console.log(`✅ Created admin: ${admin._id} (${admin.email})`);

    // Write tokens
    const jwt = require('jsonwebtoken');
    const config = require('./config/environment');
    
    [
      { user: seller, file: '../seller_token.txt' },
      { user: buyer, file: '../buyer_token.txt' },
      { user: admin, file: '../admin_token.txt' }
    ].forEach(({ user, file }) => {
      const token = jwt.sign({ id: user._id.toString() }, config.JWT_SECRET, { expiresIn: '7d' });
      require('fs').writeFileSync(file, `${user.email} ${user._id}\n${token}`);
      console.log(`✅ Token written: ${file}`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
