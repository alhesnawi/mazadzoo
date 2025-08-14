const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'معرف البائع مطلوب']
  },
  name: {
    type: String,
    required: [true, 'اسم الحيوان مطلوب'],
    trim: true,
    maxlength: [100, 'اسم الحيوان يجب أن يكون 100 حرف على الأكثر']
  },
  description: {
    type: String,
    required: [true, 'وصف الحيوان مطلوب'],
    trim: true,
    maxlength: [1000, 'الوصف يجب أن يكون 1000 حرف على الأكثر']
  },
  category: {
    type: String,
    required: [true, 'فئة الحيوان مطلوبة'],
    enum: ['طيور', 'زواحف', 'ثدييات', 'أسماك', 'حشرات', 'أخرى']
  },
  type: {
    type: String,
    required: [true, 'نوع الحيوان مطلوب'],
    trim: true
  },
  breed: {
    type: String,
    trim: true
  },
  age: {
    type: String,
    required: [true, 'عمر الحيوان مطلوب'],
    trim: true
  },
  gender: {
    type: String,
    required: [true, 'جنس الحيوان مطلوب'],
    enum: ['ذكر', 'أنثى', 'غير محدد']
  },
  approximateWeight: {
    type: String,
    trim: true
  },
  healthCondition: {
    type: String,
    required: [true, 'الحالة الصحية مطلوبة'],
    enum: ['ممتاز', 'جيد جداً', 'جيد', 'يحتاج رعاية', 'مريض']
  },
  images: [{
    type: String,
    required: true
  }],
  video: {
    type: String,
    required: [true, 'فيديو الحيوان مطلوب']
  },
  healthCertificate: {
    type: String,
    required: [true, 'الشهادة الصحية مطلوبة']
  },
  startPrice: {
    type: Number,
    required: [true, 'سعر الافتتاح مطلوب'],
    min: [1, 'سعر الافتتاح يجب أن يكون أكبر من صفر']
  },
  reservePrice: {
    type: Number,
    required: [true, 'سعر التحفظ مطلوب'],
    min: [1, 'سعر التحفظ يجب أن يكون أكبر من صفر']
  },
  buyItNowPrice: {
    type: Number,
    min: [1, 'سعر الشراء الفوري يجب أن يكون أكبر من صفر']
  },
  currentBid: {
    type: Number,
    default: function() {
      return this.startPrice;
    }
  },
  highestBidderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  auctionStartTime: {
    type: Date
  },
  auctionEndTime: {
    type: Date
  },
  auctionDuration: {
    type: Number,
    default: 20 // minutes
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'ended', 'sold', 'cancelled'],
    default: 'pending'
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  location: {
    city: {
      type: String,
      trim: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  views: {
    type: Number,
    default: 0
  },
  bidCount: {
    type: Number,
    default: 0
  },
  watchlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for bids
animalSchema.virtual('bids', {
  ref: 'Bid',
  localField: '_id',
  foreignField: 'animalId'
});

// Virtual for seller info
animalSchema.virtual('seller', {
  ref: 'User',
  localField: 'sellerId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to validate prices
animalSchema.pre('save', function(next) {
  if (this.reservePrice < this.startPrice) {
    return next(new Error('سعر التحفظ يجب أن يكون أكبر من أو يساوي سعر الافتتاح'));
  }
  
  if (this.buyItNowPrice && this.buyItNowPrice <= this.reservePrice) {
    return next(new Error('سعر الشراء الفوري يجب أن يكون أكبر من سعر التحفظ'));
  }
  
  next();
});

// Instance method to start auction
animalSchema.methods.startAuction = function() {
  this.status = 'active';
  this.auctionStartTime = new Date();
  this.auctionEndTime = new Date(Date.now() + this.auctionDuration * 60 * 1000);
};

// Instance method to end auction
animalSchema.methods.endAuction = function() {
  this.status = 'ended';
  if (this.currentBid >= this.reservePrice && this.highestBidderId) {
    this.status = 'sold';
  }
};

// Instance method to extend auction
animalSchema.methods.extendAuction = function(minutes = 1) {
  if (this.status === 'active') {
    this.auctionEndTime = new Date(this.auctionEndTime.getTime() + minutes * 60 * 1000);
  }
};

// Instance method to place bid
animalSchema.methods.placeBid = function(bidderId, amount) {
  if (amount > this.currentBid) {
    this.currentBid = amount;
    this.highestBidderId = bidderId;
    this.bidCount += 1;
    
    // Extend auction if bid placed in last minute
    const timeLeft = this.auctionEndTime - new Date();
    if (timeLeft <= 60000) { // 1 minute in milliseconds
      this.extendAuction(1);
    }
    
    return true;
  }
  return false;
};

// Index for search
animalSchema.index({ name: 'text', description: 'text', category: 'text', type: 'text' });
animalSchema.index({ status: 1, auctionEndTime: 1 });
animalSchema.index({ sellerId: 1, status: 1 });

module.exports = mongoose.model('Animal', animalSchema);

