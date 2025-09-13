// ملف جديد لـ rate limiting مخصص
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    success: false,
    message: 'تم تجاوز عدد المحاولات المسموحة. حاول مرة أخرى بعد 15 دقيقة'
  }
});

const bidLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 bids per minute
  message: {
    success: false,
    message: 'تم تجاوز عدد المزايدات المسموحة في الدقيقة'
  }
});

module.exports = { authLimiter, bidLimiter };