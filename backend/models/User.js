const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'اسم المستخدم مطلوب'],
    unique: true,
    trim: true,
    minlength: [3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'],
    maxlength: [30, 'اسم المستخدم يجب أن يكون 30 حرف على الأكثر']
  },
  email: {
    type: String,
    required: [true, 'البريد الإلكتروني مطلوب'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'البريد الإلكتروني غير صحيح']
  },
  phoneNumber: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
    unique: true,
    match: [/^(\+218|0)?[0-9]{9}$/, 'رقم الهاتف غير صحيح']
  },
  password: {
    type: String,
    required: [true, 'كلمة المرور مطلوبة'],
    minlength: [6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'],
    select: false
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    default: 'buyer'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    select: false
  },
  verificationCodeExpires: {
    type: Date,
    select: false
  },
  balance: {
    type: Number,
    default: 0,
    min: [0, 'الرصيد لا يمكن أن يكون سالباً']
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    default: 'ليبيا',
    trim: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  fcmToken: {
    type: String,
    default: null
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  // إضافة حقل لتتبع آخر تغيير في كلمة المرور
  passwordChangedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user's animals
userSchema.virtual('animals', {
  ref: 'Animal',
  localField: '_id',
  foreignField: 'sellerId'
});

// Virtual for user's bids
userSchema.virtual('bids', {
  ref: 'Bid',
  localField: '_id',
  foreignField: 'bidderId'
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to generate verification code
userSchema.methods.createVerificationCode = function() {
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  this.verificationCode = verificationCode;
  this.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return verificationCode;
};

// Instance method to update rating
userSchema.methods.updateRating = function(newRating) {
  const totalScore = this.rating * this.totalRatings + newRating;
  this.totalRatings += 1;
  this.rating = totalScore / this.totalRatings;
};

// إضافة method للتحقق من صحة الـ token
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// إضافة دالة إنشاء رمز إعادة تعيين كلمة المرور
userSchema.methods.createPasswordResetToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// إضافة index للتأكد من تفرد اسم المستخدم
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phoneNumber: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);

