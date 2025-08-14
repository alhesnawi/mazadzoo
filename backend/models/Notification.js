const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'معرف المستخدم مطلوب']
  },
  type: {
    type: String,
    required: [true, 'نوع الإشعار مطلوب'],
    enum: [
      'new_bid',
      'outbid',
      'auction_ending',
      'auction_ended',
      'won_auction',
      'lost_auction',
      'payment_success',
      'payment_failed',
      'refund_success',
      'animal_approved',
      'animal_rejected',
      'message_received',
      'system_announcement'
    ]
  },
  title: {
    type: String,
    required: [true, 'عنوان الإشعار مطلوب'],
    trim: true,
    maxlength: [100, 'عنوان الإشعار يجب أن يكون 100 حرف على الأكثر']
  },
  message: {
    type: String,
    required: [true, 'نص الإشعار مطلوب'],
    trim: true,
    maxlength: [500, 'نص الإشعار يجب أن يكون 500 حرف على الأكثر']
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Virtual for user info
notificationSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
};

// Index for performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);

