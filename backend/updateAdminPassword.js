require('dotenv').config();
const mongoose = require('mongoose');

async function updateAdminPassword() {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoURI);
    
    const User = require('./models/User');
    
    const admin = await User.findOne({ email: 'admin@mazadzoo.com' });
    
    if (!admin) {
      console.log('❌ Admin not found!');
      await mongoose.connection.close();
      process.exit(1);
    }
    
    console.log('📝 Current admin info:');
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   Phone:', admin.phoneNumber);
    console.log('');
    
    // Update password (will be auto-hashed by pre-save hook)
    admin.password = 'Admin123456!@#';
    await admin.save();
    
    console.log('✅ Password updated!');
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('📋 Login Credentials:');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:    admin@mazadzoo.com');
    console.log('🔐 Password: Admin123456!@#');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('🚀 Now test login at: http://localhost:5174');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

updateAdminPassword();
