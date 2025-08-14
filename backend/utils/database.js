const mongoose = require('mongoose');
const config = require('../config/environment');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    console.log('تشغيل بدون قاعدة بيانات للاختبار...');
    // Don't exit in development mode
    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;

