const mongoose = require('mongoose');
const User = require('./models/User');
const config = require('./config/environment');
const { signToken } = require('./utils/helpers');

const run = async () => {
  await mongoose.connect(config.MONGODB_URI);
  const user = await User.findOne({ email: 'seller1@example.com' });
  if (!user) { console.error('Seller not found'); process.exit(1); }
  const token = signToken(user._id);
  console.log('TOKEN:', token);
  await mongoose.connection.close();
};

run().catch(err => { console.error(err); process.exit(1); });
