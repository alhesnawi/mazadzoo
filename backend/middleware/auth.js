const jwt = require('jsonwebtoken');
const config = require('../config/environment');
const User = require('../models/User');

// 📋 قائمة الـ public routes المسموح بها بدون توكن
const PUBLIC_ROUTES = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/verify',
  '/api/auth/resend-verification',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/refresh',
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('📝 Token found in header');
    }
    
    console.log(`🔐 Auth Check: ${method} ${originalUrl}`);
    // In development, log incoming headers to debug proxy/header forwarding issues
    if (process.env.NODE_ENV === 'development') {
      try {
        console.log('🔍 Request headers:', JSON.stringify(req.headers));
      } catch (e) {
        console.log('🔍 Request headers (raw):', req.headers);
      }
    }
    
    // 🔓 التحقق إذا كان route عامًا
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      console.log(`✅ Token verified for user ID: ${decoded.id}`);
      originalUrl.startsWith(route + '/')
    );
    
    // 🔓 GET requests للحيوانات والبيدز مسموح بها
    // Allow public GETs for listing animals and viewing a single animal by id,
    // but NOT for protected endpoints like /api/animals/watchlist
    const isPublicGet = method === 'GET' && (
      path === '/api/animals' ||
      // match /api/animals/:id where id looks like a 24-hex ObjectId
      /^\/api\/animals\/[0-9a-fA-F]{24}$/.test(path) ||
      path.startsWith('/api/bids/animal/')
    );
    
    if (isPublicRoute || isPublicGet) {
      console.log(`✅ Public route allowed: ${method} ${originalUrl}`);
      return next();
    }
    
    console.log(`🔒 Protected route requires token: ${method} ${originalUrl}`);
    
    let token;

    // الحصول على التوكن من header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('📝 Token found in header');
    }

    // التأكد من وجود التوكن
    if (!token) {
      console.log(`✅ User authenticated: ${user.email} (${user.role})`);
      return res.status(401).json({
        success: false,
        message: 'غير مصرح لك بالوصول إلى هذا المورد. يرجى تسجيل الدخول أولاً.'
      });
    }

    try {
      // التحقق من صحة التوكن
      const decoded = jwt.verify(token, config.JWT_SECRET);
      console.log(`✅ Token verified for user ID: ${decoded.id}`);
      
      // جلب بيانات المستخدم من قاعدة البيانات
      const user = await User.findById(decoded.id).select('+password');
      
      if (!user) {
        console.log(`❌ User not found in database: ${decoded.id}`);
        return res.status(401).json({
          success: false,
          message: 'المستخدم غير موجود في النظام'
        });
      }

      // التحقق من حالة المستخدم
      if (!user.isActive) {
        console.log(`❌ User account is inactive: ${decoded.id}`);
        return res.status(401).json({
          success: false,
          message: 'تم إيقاف حسابك. يرجى التواصل مع الدعم الفني.'
        });
      }

      // ✅ إضافة بيانات المستخدم إلى request
      req.user = {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive
      };
      
      console.log(`✅ User authenticated: ${user.email} (${user.role})`);
      next();
      
    } catch (jwtError) {
      console.error('❌ JWT verification failed:', jwtError.message);
      
      // تحديد نوع الخطأ
      let errorMessage = 'رمز الدخول غير صالح';
      if (jwtError.name === 'TokenExpiredError') {
        errorMessage = 'انتهت صلاحية رمز الدخول. يرجى تسجيل الدخول مجددًا.';
      } else if (jwtError.name === 'JsonWebTokenError') {
        errorMessage = 'رمز الدخول غير صحيح';
      }
      
      return res.status(401).json({
        success: false,
        message: errorMessage
      });
    }
    
  } catch (error) {
    console.error('🔥 Unexpected error in protect middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ غير متوقع في الخادم'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      console.log(`👑 Authorization check for roles: ${roles.join(', ')}`);
      
      // التحقق من وجود user في request
      if (!req.user) {
        console.log('❌ No user found for authorization');
        return res.status(401).json({
          success: false,
          message: 'لم يتم التعرف على المستخدم'
        });
      }
      
      console.log(`👤 User role: ${req.user.role}, required roles: ${roles.join(', ')}`);
      
      // التحقق من الصلاحيات
      if (!roles.includes(req.user.role)) {
        console.log(`❌ Unauthorized access attempt: ${req.user.role} trying to access ${roles.join(', ')} route`);
        return res.status(403).json({
          success: false,
          message: `غير مصرح لك بالوصول إلى هذا المورد. الصلاحية المطلوبة: ${roles.join(' أو ')}`
        });
      }
      
      console.log(`✅ User ${req.user.email} authorized as ${req.user.role}`);
      next();
      
    } catch (error) {
      console.error('Error in authorize middleware:', error);
      return res.status(500).json({
        success: false,
        message: 'خطأ في التحقق من الصلاحيات'
      });
    }
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    // محاولة جلب التوكن
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // إذا كان هناك توكن، نحاول التحقق منه
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
          console.log(`👤 Optional auth: User found - ${user.email}`);
        } else {
          console.log('👤 Optional auth: User not found or inactive');
        }
      } catch (error) {
        // تجاهل أخطاء التوكن في الـ optional auth
        console.log('👤 Optional auth: Invalid token - continuing without user');
      }
    } else {
      console.log('👤 Optional auth: No token provided');
    }
    
    next();
  } catch (error) {
    console.error('Error in optionalAuth middleware:', error);
    next(); // نستمر حتى في حالة الخطأ
  }
};

module.exports = { 
  protect, 
  authorize, 
  optionalAuth 
};