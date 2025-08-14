const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/environment');

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN
  });
};

// Create and send token response
const createSendToken = (user, statusCode, res, message = 'تم بنجاح') => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    message,
    token,
    data: {
      user
    }
  });
};

// Generate random string
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Format phone number
const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Add country code if not present
  if (cleaned.length === 9) {
    cleaned = '218' + cleaned;
  } else if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '218' + cleaned.substring(1);
  }
  
  return '+' + cleaned;
};

// Validate Libyan phone number
const isValidLibyanPhone = (phone) => {
  const phoneRegex = /^(\+218|218|0)?[0-9]{9}$/;
  return phoneRegex.test(phone);
};

// Generate transaction ID
const generateTransactionId = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `TXN_${timestamp}_${random}`.toUpperCase();
};

// Calculate auction end time
const calculateAuctionEndTime = (startTime, durationMinutes) => {
  return new Date(startTime.getTime() + durationMinutes * 60 * 1000);
};

// Check if auction should be extended
const shouldExtendAuction = (endTime, extensionMinutes = 1) => {
  const now = new Date();
  const timeLeft = endTime - now;
  return timeLeft <= 60000; // 1 minute in milliseconds
};

// Format currency
const formatCurrency = (amount, currency = 'LYD') => {
  return new Intl.NumberFormat('ar-LY', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount);
};

// Sanitize filename
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
};

// Get file extension
const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

// Check if file is image
const isImageFile = (mimetype) => {
  return mimetype.startsWith('image/');
};

// Check if file is video
const isVideoFile = (mimetype) => {
  return mimetype.startsWith('video/');
};

// Check if file is PDF
const isPDFFile = (mimetype) => {
  return mimetype === 'application/pdf';
};

// Pagination helper
const getPagination = (page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const skip = (pageNum - 1) * limitNum;
  
  return {
    page: pageNum,
    limit: limitNum,
    skip
  };
};

// API Response helper
const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = {
    success,
    message
  };
  
  if (data) {
    response.data = data;
  }
  
  res.status(statusCode).json(response);
};

// Error response helper
const sendError = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  res.status(statusCode).json(response);
};

module.exports = {
  signToken,
  createSendToken,
  generateRandomString,
  generateOTP,
  formatPhoneNumber,
  isValidLibyanPhone,
  generateTransactionId,
  calculateAuctionEndTime,
  shouldExtendAuction,
  formatCurrency,
  sanitizeFilename,
  getFileExtension,
  isImageFile,
  isVideoFile,
  isPDFFile,
  getPagination,
  sendResponse,
  sendError
};

