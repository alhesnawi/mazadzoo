const mongoose = require('mongoose');
const config = require('./config/environment');
const User = require('./models/User');
const { signToken } = require('./utils/helpers');

(async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    const u = await User.findOne({ email: 'admin@mazadzoo.com' });
    if (!u) { console.error('admin not found'); process.exit(1); }
    console.log('ADMIN_TOKEN:' + signToken(u._id));
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.connection.close();
  }
})();
