require('dotenv').config();
const mongoose = require('mongoose');

async function createTestData() {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoURI);
    
    console.log('✅ متصل بقاعدة البيانات\n');
    
    const User = require('./models/User');
    const Animal = require('./models/Animal');
    
    // 1. إنشاء بائع
    console.log('1️⃣ إنشاء حساب بائع...');
    let seller = await User.findOne({ email: 'seller1@test.com' });
    if (!seller) {
      seller = await User.findOne({ username: 'seller1' });
      if (seller) {
        // تحديث البيانات
        seller.email = 'seller1@test.com';
        seller.password = 'Test123456!';
        seller.isVerified = true;
        seller.status = 'active';
        await seller.save();
        console.log('   ✅ تم تحديث البائع');
      } else {
        seller = new User({
          email: 'seller1@test.com',
          password: 'Test123456!',
          fullName: 'علي البائع',
          phoneNumber: '+218911111111',
          username: 'seller_test1',
          role: 'seller',
          isVerified: true,
          status: 'active'
        });
        await seller.save();
        console.log('   ✅ تم إنشاء البائع');
      }
    } else {
      console.log('   ⚠️  البائع موجود بالفعل');
    }
    
    // 2. إنشاء مشتري
    console.log('2️⃣ إنشاء حساب مشتري...');
    let buyer = await User.findOne({ email: 'buyer1@test.com' });
    if (!buyer) {
      buyer = await User.findOne({ username: 'buyer1' });
      if (buyer) {
        buyer.email = 'buyer1@test.com';
        buyer.password = 'Test123456!';
        buyer.isVerified = true;
        buyer.status = 'active';
        buyer.balance = 50000;
        await buyer.save();
        console.log('   ✅ تم تحديث المشتري (رصيد: 50000)');
      } else {
        buyer = new User({
          email: 'buyer1@test.com',
          password: 'Test123456!',
          fullName: 'أحمد المشتري',
          phoneNumber: '+218922222222',
          username: 'buyer_test1',
          role: 'buyer',
          isVerified: true,
          status: 'active',
          balance: 50000
        });
        await buyer.save();
        console.log('   ✅ تم إنشاء المشتري (رصيد: 50000)');
      }
    } else {
      // تحديث الرصيد
      buyer.balance = 50000;
      await buyer.save();
      console.log('   ⚠️  المشتري موجود - تم تحديث الرصيد: 50000');
    }
    
    // 3. إنشاء حيوانات للمزاد
    console.log('3️⃣ إنشاء حيوانات للمزاد...');
    
    const animals = [
      {
        name: 'حصان عربي أصيل',
        species: 'حصان',
        age: 5,
        gender: 'ذكر',
        weight: 450,
        description: 'حصان عربي نادر بمواصفات عالية جداً، مدرب ومطيع',
        startingPrice: 5000,
        currentBid: 5000,
        seller: seller._id,
        status: 'active',
        category: 'للبيع',
        healthStatus: 'ممتاز',
        location: 'طرابلس، ليبيا'
      },
      {
        name: 'جمل سباق سريع',
        species: 'جمل',
        age: 4,
        gender: 'ذكر',
        weight: 600,
        description: 'جمل سباق بطل حاصل على عدة جوائز',
        startingPrice: 8000,
        currentBid: 8000,
        seller: seller._id,
        status: 'active',
        category: 'للبيع',
        healthStatus: 'ممتاز',
        location: 'بنغازي، ليبيا'
      },
      {
        name: 'ماعز نوبي نادر',
        species: 'ماعز',
        age: 2,
        gender: 'أنثى',
        weight: 45,
        description: 'ماعز نوبي نادر، إنتاج حليب عالي',
        startingPrice: 1500,
        currentBid: 1500,
        seller: seller._id,
        status: 'active',
        category: 'للبيع',
        healthStatus: 'جيد',
        location: 'مصراتة، ليبيا'
      }
    ];
    
    for (const animalData of animals) {
      const existing = await Animal.findOne({ name: animalData.name });
      if (!existing) {
        // حساب وقت انتهاء المزاد (24 ساعة من الآن)
        const auctionEndDate = new Date();
        auctionEndDate.setDate(auctionEndDate.getDate() + 1);
        animalData.auctionEndDate = auctionEndDate;
        
        const animal = new Animal(animalData);
        await animal.save();
        console.log(`   ✅ تم إضافة: ${animalData.name}`);
      } else {
        console.log(`   ⚠️  موجود: ${animalData.name}`);
      }
    }
    
    console.log('\n═══════════════════════════════════════');
    console.log('✅ تم إنشاء البيانات التجريبية بنجاح!');
    console.log('═══════════════════════════════════════\n');
    
    console.log('📋 الحسابات الجاهزة:\n');
    
    console.log('👤 البائع (Seller):');
    console.log('   📧 Email: seller1@test.com');
    console.log('   🔐 Password: Test123456!\n');
    
    console.log('👤 المشتري (Buyer):');
    console.log('   📧 Email: buyer1@test.com');
    console.log('   🔐 Password: Test123456!');
    console.log('   💰 الرصيد: 50,000 دينار\n');
    
    console.log('👤 المدير (Admin):');
    console.log('   📧 Email: admin@mazadzoo.com');
    console.log('   🔐 Password: Admin123456!@#\n');
    
    console.log('═══════════════════════════════════════');
    console.log('🚀 الروابط:');
    console.log('═══════════════════════════════════════');
    console.log('🌐 Auction: https://animated-barnacle-r469r755gw7xc5rjr-5173.app.github.dev');
    console.log('🔧 Admin: https://animated-barnacle-r469r755gw7xc5rjr-5174.app.github.dev');
    console.log('═══════════════════════════════════════\n');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createTestData();
