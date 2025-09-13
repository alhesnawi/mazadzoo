// ملف جديد لجدولة انتهاء المزادات
const cron = require('node-cron');
const Animal = require('../models/Animal');

// فحص المزادات المنتهية كل دقيقة
cron.schedule('* * * * *', async () => {
  try {
    const expiredAuctions = await Animal.find({
      status: 'active',
      auctionEndTime: { $lte: new Date() }
    });
    
    for (const animal of expiredAuctions) {
      animal.endAuction();
      await animal.save();
    }
  } catch (error) {
    console.error('Error checking expired auctions:', error);
  }
});