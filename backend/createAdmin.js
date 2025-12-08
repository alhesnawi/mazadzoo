/**
 * Create Admin User Script
 * لإنشاء حساب مدير للوحة التحكم
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const ADMIN_CREDENTIALS = {
  email: 'admin@mazadzoo.com',
  password: 'Admin123456!@#',
  fullName: 'مدير النظام',
  phoneNumber: '+218912345678',
  role: 'admin',
  isVerified: true,
  status: 'active'
};

async function createAdminUser() {
  try {
    console.log('🔌 الاتصال بقاعدة البيانات...');
    
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mazadzoo';
    await mongoose.connect(MONGODB_URI);
    
    console.log('✅ تم الاتصال بقاعدة البيانات\n');

    // Check if admin already exists
    console.log('🔍 البحث عن حساب Admin موجود...');
    const existingAdmin = await User.findOne({ email: ADMIN_CREDENTIALS.email });
    
    if (existingAdmin) {
      console.log('⚠️  حساب Admin موجود بالفعل!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 الاسم:', existingAdmin.fullName);
      console.log('🔑 Role:', existingAdmin.role);
      console.log('\n💡 لتغيير كلمة المرور، احذف الحساب أولاً:');
      console.log('   db.users.deleteOne({email: "admin@mazadzoo.com"})');
      
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create admin user
    console.log('📝 إنشاء حساب Admin جديد...\n');
    const adminUser = new User(ADMIN_CREDENTIALS);
    await adminUser.save();

    console.log('✅ تم إنشاء حساب Admin بنجاح!\n');
    console.log('═══════════════════════════════════════');
    console.log('📋 معلومات تسجيل الدخول:');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:    ', ADMIN_CREDENTIALS.email);
    console.log('🔐 Password: ', ADMIN_CREDENTIALS.password);
    console.log('👤 الاسم:     ', ADMIN_CREDENTIALS.fullName);
    console.log('🔑 Role:     ', ADMIN_CREDENTIALS.role);
    console.log('═══════════════════════════════════════\n');

    console.log('🚀 الآن يمكنك تسجيل الدخول إلى لوحة التحكم:');
    console.log('   1. cd admin-dashboard');
    console.log('   2. npm run dev');
    console.log('   3. افتح: http://localhost:5174');
    console.log('   4. سجل دخول بالمعلومات أعلاه\n');

    await mongoose.connection.close();
    console.log('✅ تم!');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    
    if (error.code === 11000) {
      console.log('\n⚠️  البريد الإلكتروني مستخدم بالفعل');
    }
    
    process.exit(1);
  }
}

// Run the script
createAdminUser();
