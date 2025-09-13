const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  animalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal',
    required: true
  },
  type: {
    type: String,
    enum: ['buyer_seller', 'support'],
    default: 'buyer_seller'
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'blocked'],
    default: 'active'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    buyer: { type: Number, default: 0 },
    seller: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Virtual for messages
chatSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'chatId'
});

// Virtual for animal info
chatSchema.virtual('animal', {
  ref: 'Animal',
  localField: 'animalId',
  foreignField: '_id',
  justOne: true
});

// Instance method to mark messages as read
chatSchema.methods.markAsRead = function(userId) {
  const userRole = this.participants[0].toString() === userId ? 'buyer' : 'seller';
  this.unreadCount[userRole] = 0;
};

// Index for performance
chatSchema.index({ participants: 1, animalId: 1 });
chatSchema.index({ lastMessageTime: -1 });
chatSchema.index({ status: 1 });

module.exports = mongoose.model('Chat', chatSchema);