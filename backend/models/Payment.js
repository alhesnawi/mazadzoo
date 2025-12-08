const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'معرف المستخدم مطلوب']
  },
  animalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal'
  },
  amount: {
    type: Number,
    required: [true, 'مبلغ الدفع مطلوب'],
    min: [0, 'مبلغ الدفع لا يمكن أن يكون سالباً']
  },
  currency: {
    type: String,
    default: 'LYD',
    enum: ['LYD', 'USD', 'EUR']
  },
  type: {
    type: String,
    required: [true, 'نوع المعاملة مطلوب'],
    enum: ['listing_fee', 'bidding_fee', 'final_payment', 'refund', 'deposit', 'withdrawal']
  },
  status: {
    type: String,
    required: [true, 'حالة الدفع مطلوبة'],
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: [true, 'طريقة الدفع مطلوبة'],
    enum: ['card', 'e_wallet', 'bank_transfer', 'cash', 'balance', 'moamalat']
  },
  transactionId: {
    type: String,
    required: [true, 'معرف المعاملة مطلوب'],
    unique: true
  },
  gatewayTransactionId: {
    type: String
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  description: {
    type: String,
    trim: true
  },
  refundReason: {
    type: String,
    trim: true
  },
  refundedAt: {
    type: Date
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Virtual for user info
paymentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for animal info
paymentSchema.virtual('animal', {
  ref: 'Animal',
  localField: 'animalId',
  foreignField: '_id',
  justOne: true
});

// Instance method to process refund
paymentSchema.methods.processRefund = function(reason) {
  this.status = 'refunded';
  this.refundReason = reason;
  this.refundedAt = new Date();
};

// Index for performance
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, type: 1 });
paymentSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);

