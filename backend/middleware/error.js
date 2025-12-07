const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error with proper logging
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    // Include raw body for easier debugging of JSON parse errors in development
    ...(req && req.rawBody ? { rawBody: req.rawBody } : {})
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'المورد غير موجود';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    let message = 'البيانات مكررة';
    
    if (err.keyPattern.email) {
      message = 'البريد الإلكتروني مستخدم بالفعل';
    } else if (err.keyPattern.username) {
      message = 'اسم المستخدم مستخدم بالفعل';
    } else if (err.keyPattern.phoneNumber) {
      message = 'رقم الهاتف مستخدم بالفعل';
    }
    
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'رمز التوثيق غير صحيح';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'انتهت صلاحية رمز التوثيق';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'خطأ في الخادم',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;

