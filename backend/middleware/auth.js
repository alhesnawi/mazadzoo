const jwt = require('jsonwebtoken');
const config = require('../config/environment');
const User = require('../models/User');
const logger = require('../utils/logger');

const PUBLIC_ROUTES = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/verify',
  '/api/auth/resend-verification',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/refresh',
  '/api/health',
  '/api/payments/webhook'
];

const protect = async (req, res, next) => {
  try {
    const originalUrl = req.originalUrl;
    const path = req.path;
    const method = req.method;

    logger.debug(`Auth Check: ${method} ${originalUrl}`);

    // Log headers in development for troubleshooting
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Request headers', req.headers);
    }

    const isPublicRoute = PUBLIC_ROUTES.some(route => originalUrl === route || originalUrl.startsWith(route + '/'));

    const isPublicGet = method === 'GET' && (
      path === '/api/animals' ||
      /^\/api\/animals\/[0-9a-fA-F]{24}$/.test(path) ||
      path.startsWith('/api/bids/animal/')
    );

    if (isPublicRoute || isPublicGet) {
      logger.debug(`Public route allowed: ${method} ${originalUrl}`);
      return next();
    }

    logger.debug(`Protected route requires token: ${method} ${originalUrl}`);

    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      logger.debug('Token found in header');
    }

    if (!token) {
      logger.warn('No token provided');
      return res.status(401).json({ success: false, message: 'غير مصرح لك بالوصول إلى هذا المورد. يرجى تسجيل الدخول أولاً.' });
    }

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      logger.debug(`Token verified for user ID: ${decoded.id}`);

      const user = await User.findById(decoded.id).select('+password');
      if (!user) {
        logger.warn(`User not found in database: ${decoded.id}`);
        return res.status(401).json({ success: false, message: 'المستخدم غير موجود في النظام' });
      }

      if (!user.isActive) {
        logger.warn(`User account is inactive: ${decoded.id}`);
        return res.status(401).json({ success: false, message: 'تم إيقاف حسابك. يرجى التواصل مع الدعم الفني.' });
      }

      req.user = {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive
      };

      logger.info(`User authenticated: ${user.email} (${user.role})`);
      next();
    } catch (jwtError) {
      logger.error('JWT verification failed', { message: jwtError.message });
      let errorMessage = 'رمز الدخول غير صالح';
      if (jwtError.name === 'TokenExpiredError') errorMessage = 'انتهت صلاحية رمز الدخول. يرجى تسجيل الدخول مجددًا.';
      if (jwtError.name === 'JsonWebTokenError') errorMessage = 'رمز الدخول غير صحيح';
      return res.status(401).json({ success: false, message: errorMessage });
    }
  } catch (error) {
    logger.error('Unexpected error in protect middleware', { error: error.message, stack: error.stack });
    return res.status(500).json({ success: false, message: 'حدث خطأ غير متوقع في الخادم' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      logger.debug(`Authorization check for roles: ${roles.join(', ')}`);
      if (!req.user) {
        logger.warn('No user found for authorization');
        return res.status(401).json({ success: false, message: 'لم يتم التعرف على المستخدم' });
      }

      logger.debug(`User role: ${req.user.role}, required roles: ${roles.join(', ')}`);

      if (!roles.includes(req.user.role)) {
        logger.warn(`Unauthorized access attempt: ${req.user.role}`);
        return res.status(403).json({ success: false, message: `غير مصرح لك بالوصول إلى هذا المورد. الصلاحية المطلوبة: ${roles.join(' أو ')}` });
      }

      logger.info(`User ${req.user.email} authorized as ${req.user.role}`);
      next();
    } catch (error) {
      logger.error('Error in authorize middleware', { error: error.message });
      return res.status(500).json({ success: false, message: 'خطأ في التحقق من الصلاحيات' });
    }
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user && user.isActive) {
          req.user = {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            role: user.role,
            isVerified: user.isVerified,
            isActive: user.isActive
          };
          logger.debug(`Optional auth: User found - ${user.email}`);
        } else {
          logger.debug('Optional auth: User not found or inactive');
        }
      } catch (e) {
        logger.debug('Optional auth: Invalid token - continuing without user');
      }
    } else {
      logger.debug('Optional auth: No token provided');
    }

    next();
  } catch (error) {
    logger.error('Error in optionalAuth middleware', { error: error.message });
    next();
  }
};

module.exports = { protect, authorize, optionalAuth };