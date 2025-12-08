/**
 * Create Admin User via Database Direct Connection
 * إنشاء حساب Admin مباشرة في قاعدة البيانات
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const ADMIN_DATA = {
  email: 'admin@mazadzoo.com',
  password: 'Admin123456!@#',
  fullName: 'مدير النظام',
  phoneNumber: '+218912345678',
  role: 'admin',
  isVerified: true,
  status: 'active'
};

async function createAdmin() {
  try {
    console.log('🔌 الاتصال بقاعدة البيانات...\n');

    // Get MongoDB connection from the running server
    const dbUtils = require('./utils/database');
    await dbUtils.connectDB();

    console.log('✅ متصل بقاعدة البيانات\n');

    // Import User model
    const User = require('./models/User');

    // Check if admin exists
    console.log('🔍 التحقق من حساب Admin موجود...');
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: ADMIN_DATA.email },
        { role: 'admin' }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️  يوجد حساب Admin بالفعل!\n');
      console.log('═══════════════════════════════════════');
      console.log('📧 Email:    ', existingAdmin.email);
      console.log('👤 الاسم:     ', existingAdmin.fullName);
      console.log('📱 الهاتف:    ', existingAdmin.phoneNumber);
      console.log('🔑 Role:     ', existingAdmin.role);
      console.log('✅ Verified: ', existingAdmin.isVerified);
      console.log('═══════════════════════════════════════\n');

      if (existingAdmin.email === ADMIN_DATA.email) {
        console.log('💡 استخدم هذا الحساب للدخول:');
        console.log('   Email:', ADMIN_DATA.email);
        console.log('   Password:', ADMIN_DATA.password);
      } else {
        console.log('💡 يوجد حساب admin آخر برقم الهاتف:', existingAdmin.phoneNumber);
      }

      process.exit(0);
    }

    // Create new admin
    console.log('📝 إنشاء حساب Admin جديد...\n');

    const hashedPassword = await bcrypt.hash(ADMIN_DATA.password, 10);
    
    const admin = new User({
      ...ADMIN_DATA,
      password: hashedPassword
    });

    await admin.save();

    console.log('✅ تم إنشاء حساب Admin بنجاح!\n');
    console.log('═══════════════════════════════════════');
    console.log('📋 معلومات تسجيل الدخول:');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:    ', ADMIN_DATA.email);
    console.log('🔐 Password: ', ADMIN_DATA.password);
    console.log('👤 الاسم:     ', ADMIN_DATA.fullName);
    console.log('📱 الهاتف:    ', ADMIN_DATA.phoneNumber);
    console.log('🔑 Role:     ', ADMIN_DATA.role);
    console.log('═══════════════════════════════════════\n');

    console.log('🚀 الآن يمكنك تسجيل الدخول:');
    console.log('   1. افتح: http://localhost:5174');
    console.log('   2. استخدم البيانات أعلاه\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ خطأ:', error.message);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      console.log(`\n⚠️  ${field} مستخدم بالفعل`);
    }
    
    process.exit(1);
  }
}

createAdmin();
