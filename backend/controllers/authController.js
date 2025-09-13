const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const { createSendToken, generateOTP, formatPhoneNumber, sendResponse, sendError } = require('../utils/helpers');
const logger = require('../utils/logger');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'بيانات غير صحيحة', errors.array());
    }

    const { username, email, phoneNumber, password, role } = req.body;

    // Format phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Create user
    const user = await User.create({
      username,
      email,
      phoneNumber: formattedPhone,
      password,
      role: role || 'buyer'
    });

    // Generate verification code
    const verificationCode = user.createVerificationCode();
    await user.save({ validateBeforeSave: false });

    // Send SMS with verification code
    try {
      // In production, integrate with SMS service like Twilio, AWS SNS, or local provider
      // For now, we'll use a mock implementation that logs in development
      if (process.env.NODE_ENV === 'development') {
        logger.info(`[DEV] Verification code for ${user.phoneNumber}: ${verificationCode}`);
      } else {
        // TODO: Replace with actual SMS service integration
        // Example: await sendSMS(user.phoneNumber, `Your verification code is: ${verificationCode}`);
        logger.warn('SMS service not configured for production', { phoneNumber: user.phoneNumber });
      }
    } catch (smsError) {
      logger.error('Failed to send SMS:', { phoneNumber: user.phoneNumber, error: smsError.message, stack: smsError.stack });
      // Don't fail registration if SMS fails, user can resend
    }

    createSendToken(user, 201, res, 'تم إنشاء الحساب بنجاح. يرجى التحقق من رقم الهاتف');
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'بيانات غير صحيحة', errors.array());
    }

    const { email, password } = req.body;

    // Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return sendError(res, 401, 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    // Check if user is active
    if (!user.isActive) {
      return sendError(res, 401, 'تم إيقاف حسابك');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    createSendToken(user, 200, res, 'تم تسجيل الدخول بنجاح');
  } catch (error) {
    next(error);
  }
};

// @desc    Verify phone number
// @route   POST /api/auth/verify
// @access  Public
const verifyPhone = async (req, res, next) => {
  try {
    const { phoneNumber, verificationCode } = req.body;

    if (!phoneNumber || !verificationCode) {
      return sendError(res, 400, 'رقم الهاتف ورمز التحقق مطلوبان');
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);

    const user = await User.findOne({
      phoneNumber: formattedPhone,
      verificationCode,
      verificationCodeExpires: { $gt: Date.now() }
    }).select('+verificationCode +verificationCodeExpires');

    if (!user) {
      return sendError(res, 400, 'رمز التحقق غير صحيح أو منتهي الصلاحية');
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save({ validateBeforeSave: false });

    createSendToken(user, 200, res, 'تم التحقق من رقم الهاتف بنجاح');
  } catch (error) {
    next(error);
  }
};

// @desc    Resend verification code
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return sendError(res, 400, 'رقم الهاتف مطلوب');
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);

    const user = await User.findOne({ phoneNumber: formattedPhone });

    if (!user) {
      return sendError(res, 404, 'المستخدم غير موجود');
    }

    if (user.isVerified) {
      return sendError(res, 400, 'رقم الهاتف محقق بالفعل');
    }

    // Generate new verification code
    const verificationCode = user.createVerificationCode();
    await user.save({ validateBeforeSave: false });

    // TODO: Send SMS with verification code
    logger.info(`New verification code for ${user.phoneNumber}: ${verificationCode}`, { phoneNumber: user.phoneNumber });

    sendResponse(res, 200, true, 'تم إرسال رمز التحقق الجديد');
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    sendResponse(res, 200, true, 'تم جلب بيانات المستخدم بنجاح', { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'بيانات غير صحيحة', errors.array());
    }

    const fieldsToUpdate = {
      username: req.body.username,
      address: req.body.address,
      city: req.body.city,
      country: req.body.country
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    sendResponse(res, 200, true, 'تم تحديث الملف الشخصي بنجاح', { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'بيانات غير صحيحة', errors.array());
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.correctPassword(currentPassword, user.password))) {
      return sendError(res, 400, 'كلمة المرور الحالية غير صحيحة');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    createSendToken(user, 200, res, 'تم تغيير كلمة المرور بنجاح');
  } catch (error) {
    next(error);
  }
};

// Validation rules
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('اسم المستخدم يجب أن يكون بين 3 و 30 حرف')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط'),
  body('email')
    .isEmail()
    .withMessage('البريد الإلكتروني غير صحيح')
    .normalizeEmail(),
  body('phoneNumber')
    .matches(/^(\+218|218|0)?[0-9]{9}$/)
    .withMessage('رقم الهاتف غير صحيح'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  body('role')
    .optional()
    .isIn(['buyer', 'seller'])
    .withMessage('الدور يجب أن يكون buyer أو seller')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('البريد الإلكتروني غير صحيح')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('كلمة المرور مطلوبة')
];

const updateProfileValidation = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('اسم المستخدم يجب أن يكون بين 3 و 30 حرف')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط'),
  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('العنوان يجب أن يكون 200 حرف على الأكثر'),
  body('city')
    .optional()
    .isLength({ max: 50 })
    .withMessage('المدينة يجب أن تكون 50 حرف على الأكثر'),
  body('country')
    .optional()
    .isLength({ max: 50 })
    .withMessage('البلد يجب أن يكون 50 حرف على الأكثر')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('كلمة المرور الحالية مطلوبة'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل')
];

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'بيانات غير صحيحة', errors.array());
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 404, 'لا يوجد مستخدم بهذا البريد الإلكتروني');
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // TODO: Send email with reset token
    // For now, log it in development
    if (process.env.NODE_ENV === 'development') {
      logger.info(`[DEV] Password reset token for ${user.email}: ${resetToken}`);
    }

    sendResponse(res, 200, true, 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'بيانات غير صحيحة', errors.array());
    }

    const { token, password } = req.body;

    // Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return sendError(res, 400, 'الرمز غير صحيح أو منتهي الصلاحية');
    }

    // Set new password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res, 'تم إعادة تعيين كلمة المرور بنجاح');
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, 400, 'رمز التحديث مطلوب');
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return sendError(res, 401, 'رمز التحديث غير صحيح');
    }

    createSendToken(user, 200, res, 'تم تحديث الرمز بنجاح');
  } catch (error) {
    return sendError(res, 401, 'رمز التحديث غير صحيح');
  }
};

// Additional validation rules
const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('البريد الإلكتروني غير صحيح')
    .normalizeEmail
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('رمز إعادة التعيين مطلوب'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
];

module.exports = {
  register,
  login,
  verifyPhone,
  resendVerification,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation
};

