const mongoose = require('mongoose');
const config = require('./config/environment');
const User = require('./models/User');
const { signToken } = require('./utils/helpers');

const email = process.argv[2];
if (!email) { console.error('Usage: node generateTokenFor.js <email>'); process.exit(1); }

(async () => {
  await mongoose.connect(config.MONGODB_URI);
  const user = await User.findOne({ email });
  if (!user) { console.error('User not found:', email); process.exit(1); }
  console.log(user.email, user._id.toString());
  console.log(signToken(user._id));
  await mongoose.connection.close();
})();
