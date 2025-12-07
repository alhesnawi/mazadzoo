const mongoose = require('mongoose');
const config = require('./config/environment');
const User = require('./models/User');
const Animal = require('./models/Animal');

(async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    const seller = await User.findOne({ email: 'seller1@example.com' });
    if (!seller) { console.error('seller not found'); process.exit(1); }

    const existing = await Animal.findOne({ name: 'Test Eagle' });
    if (existing) { console.log('Animal already exists:', existing._id); process.exit(0); }

    const animal = await Animal.create({
      sellerId: seller._id,
      name: 'Test Eagle',
      description: 'A test eagle for automated testing',
      category: 'طيور',
      type: 'نسر',
      age: '3 سنوات',
      gender: 'ذكر',
      healthCondition: 'ممتاز',
      images: ['uploads/images/test1.jpg','uploads/images/test2.jpg','uploads/images/test3.jpg'],
      video: 'uploads/videos/test.mp4',
      healthCertificate: 'uploads/certificates/test.pdf',
      startPrice: 100,
      reservePrice: 150,
      buyItNowPrice: 500,
      isApproved: true,
      status: 'pending'
    });

    console.log('Created animal id:', animal._id);
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
})();
