// ملف جديد لجدولة انتهاء المزادات
const cron = require('node-cron');
const Animal = require('../models/Animal');
const logger = require('./logger');

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
    logger.error('Error checking expired auctions', { message: error.message, stack: error.stack });
  }
});