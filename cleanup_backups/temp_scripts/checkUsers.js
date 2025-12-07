const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = 'mongodb+srv://m82basheer2:JFdfY.N2S9MZZBn@animal.uxhyyex.mongodb.net/?appName=animal';

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    const count = await User.countDocuments();
    console.log('Total users:', count);
    
    const users = await User.find().limit(10);
    users.forEach(u => {
      console.log(`- ${u._id}: ${u.email} (${u.role})`);
    });

    const targetId = '69356b6d7b67c6a10e316f42';
    const target = await User.findById(targetId);
    console.log('\nLooking for:', targetId);
    console.log('Found:', target ? target.email : 'NOT FOUND');

    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
