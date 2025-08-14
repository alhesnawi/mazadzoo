const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  animalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal',
    required: [true, 'معرف الحيوان مطلوب']
  },
  bidderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'معرف المزايد مطلوب']
  },
  bidAmount: {
    type: Number,
    required: [true, 'مبلغ المزايدة مطلوب'],
    min: [1, 'مبلغ المزايدة يجب أن يكون أكبر من صفر']
  },
  bidTime: {
    type: Date,
    default: Date.now
  },
  isWinningBid: {
    type: Boolean,
    default: false
  },
  isAutoBid: {
    type: Boolean,
    default: false
  },
  maxAutoBidAmount: {
    type: Number,
    min: [1, 'الحد الأقصى للمزايدة التلقائية يجب أن يكون أكبر من صفر']
  }
}, {
  timestamps: true
});

// Virtual for animal info
bidSchema.virtual('animal', {
  ref: 'Animal',
  localField: 'animalId',
  foreignField: '_id',
  justOne: true
});

// Virtual for bidder info
bidSchema.virtual('bidder', {
  ref: 'User',
  localField: 'bidderId',
  foreignField: '_id',
  justOne: true
});

// Index for performance
bidSchema.index({ animalId: 1, bidTime: -1 });
bidSchema.index({ bidderId: 1, bidTime: -1 });
bidSchema.index({ animalId: 1, bidAmount: -1 });

module.exports = mongoose.model('Bid', bidSchema);

