const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = 'mongodb+srv://m82basheer2:JFdfY.N2S9MZZBn@animal.uxhyyex.mongodb.net/?appName=animal';

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = [
      { _id: mongoose.Types.ObjectId.createFromHexString('69356b6d7b67c6a10e316f42'), email: 'seller1@example.com', username: 'seller1', password: 'Password123!', phoneNumber: '+218912345678', role: 'seller', isVerified: true, isActive: true },
      { _id: mongoose.Types.ObjectId.createFromHexString('6934bd03986f946566534996'), email: 'buyer1@example.com', username: 'buyer1', password: 'Password123!', phoneNumber: '+218912345679', role: 'buyer', isVerified: true, isActive: true },
      { _id: mongoose.Types.ObjectId.createFromHexString('69356d16a204ccc2e8082735'), email: 'admin1@example.com', username: 'admin1', password: 'Password123!', phoneNumber: '+218912345680', role: 'admin', isVerified: true, isActive: true }
    ];

    for (const userData of users) {
      const existing = await User.findById(userData._id);
      if (!existing) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created user: ${userData.email}`);
      } else {
        console.log(`ℹ️  User exists: ${userData.email}`);
      }
    }

    await mongoose.connection.close();
    console.log('Done');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
