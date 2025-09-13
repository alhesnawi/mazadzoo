const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const config = require('./environment');

// Rate limiting configurations
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different rate limits for different endpoints
const rateLimiters = {
  // General API rate limit
  general: createRateLimiter(
    config.RATE_LIMIT_WINDOW_MS,
    config.RATE_LIMIT_MAX_REQUESTS,
    'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً'
  ),
  
  // Strict rate limit for authentication endpoints
  auth: createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    5, // 5 attempts
    'تم تجاوز عدد محاولات تسجيل الدخول. يرجى المحاولة بعد 15 دقيقة'
  ),
  
  // Rate limit for bidding
  bidding: createRateLimiter(
    60 * 1000, // 1 minute
    10, // 10 bids per minute
    'تم تجاوز عدد المزايدات المسموح. يرجى الانتظار قليلاً'
  ),
  
  // Rate limit for file uploads
  upload: createRateLimiter(
    60 * 1000, // 1 minute
    5, // 5 uploads per minute
    'تم تجاوز عدد التحميلات المسموح. يرجى الانتظار قليلاً'
  )
};

// Helmet configuration for security headers
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      config.CORS_ORIGIN,
      config.SOCKET_CORS_ORIGIN,
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174'
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('غير مسموح بالوصول من هذا المصدر'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Security middleware function
const applySecurity = (app) => {
  // Apply helmet for security headers
  app.use(helmetConfig);
  
  // Disable x-powered-by header
  app.disable('x-powered-by');
  
  // Trust proxy if behind reverse proxy
  if (config.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }
};

module.exports = {
  rateLimiters,
  corsOptions,
  applySecurity
};