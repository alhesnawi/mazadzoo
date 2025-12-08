require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    const User = require('./models/User');
    const Animal = require('./models/Animal');
    
    const seller = await User.findOne({ email: 'seller1@test.com' });
    
    if (!seller) {
      console.log('❌ البائع غير موجود');
      process.exit(1);
    }
    
    console.log('✅ البائع:', seller.fullName);
    console.log('');
    
    const animals = [
      {
        sellerId: seller._id,
        name: 'حصان عربي أصيل',
        description: 'حصان عربي نادر بمواصفات عالية جداً، مدرب ومطيع. حاصل على جوائز عديدة في المسابقات المحلية.',
        category: 'ثدييات',
        type: 'حصان',
        breed: 'عربي أصيل',
        age: '5 سنوات',
        gender: 'ذكر',
        approximateWeight: '450 كجم',
        healthCondition: 'ممتاز',
        images: ['https://via.placeholder.com/800x600?text=Horse'],
        video: 'https://via.placeholder.com/video',
        healthCertificate: 'https://via.placeholder.com/cert',
        startPrice: 5000,
        reservePrice: 5000,
        buyItNowPrice: 10000,
        currentBid: 5000,
        status: 'active',
        location: 'طرابلس، ليبيا',
        auctionEndDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        sellerId: seller._id,
        name: 'جمل سباق سريع',
        description: 'جمل سباق بطل حاصل على عدة جوائز في سباقات الهجن المحلية والدولية',
        category: 'ثدييات',
        type: 'جمل',
        breed: 'سباق',
        age: '4 سنوات',
        gender: 'ذكر',
        approximateWeight: '600 كجم',
        healthCondition: 'ممتاز',
        images: ['https://via.placeholder.com/800x600?text=Camel'],
        video: 'https://via.placeholder.com/video',
        healthCertificate: 'https://via.placeholder.com/cert',
        startPrice: 8000,
        reservePrice: 8000,
        buyItNowPrice: 15000,
        currentBid: 8000,
        status: 'active',
        location: 'بنغازي، ليبيا',
        auctionEndDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        sellerId: seller._id,
        name: 'ماعز نوبي نادر',
        description: 'ماعز نوبي نادر، إنتاج حليب عالي جداً. سلالة نقية ممتازة للتربية',
        category: 'ثدييات',
        type: 'ماعز',
        breed: 'نوبي',
        age: '2 سنة',
        gender: 'أنثى',
        approximateWeight: '45 كجم',
        healthCondition: 'جيد جداً',
        images: ['https://via.placeholder.com/800x600?text=Goat'],
        video: 'https://via.placeholder.com/video',
        healthCertificate: 'https://via.placeholder.com/cert',
        startPrice: 1500,
        reservePrice: 1500,
        buyItNowPrice: 3000,
        currentBid: 1500,
        status: 'active',
        location: 'مصراتة، ليبيا',
        auctionEndDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    ];
    
    console.log('🐴 إنشاء الحيوانات...\n');
    
    for (const animalData of animals) {
      const existing = await Animal.findOne({ name: animalData.name });
      if (existing) {
        await Animal.updateOne({ _id: existing._id }, animalData);
        console.log('✅ محدّث:', animalData.name);
      } else {
        await Animal.create(animalData);
        console.log('✅ جديد:', animalData.name);
      }
    }
    
    console.log('\n═══════════════════════════════════════');
    console.log('🎉 تم إنشاء/تحديث جميع البيانات!');
    console.log('═══════════════════════════════════════\n');
    
    console.log('📋 الحسابات الجاهزة:\n');
    console.log('👤 البائع:');
    console.log('   📧 seller1@test.com');
    console.log('   🔐 Test123456!\n');
    
    console.log('👤 المشتري:');
    console.log('   📧 buyer1@test.com');
    console.log('   🔐 Test123456!');
    console.log('   💰 رصيد: 50,000 دينار\n');
    
    console.log('👤 المدير:');
    console.log('   📧 admin@mazadzoo.com');
    console.log('   🔐 Admin123456!@#\n');
    
    console.log('═══════════════════════════════════════');
    console.log('🌐 الروابط:');
    console.log('═══════════════════════════════════════');
    console.log('Auction: https://animated-barnacle-r469r755gw7xc5rjr-5173.app.github.dev');
    console.log('Admin:   https://animated-barnacle-r469r755gw7xc5rjr-5174.app.github.dev');
    console.log('═══════════════════════════════════════\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
})();
