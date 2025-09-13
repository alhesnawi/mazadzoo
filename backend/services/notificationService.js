const firebaseService = require('./firebaseService');
const User = require('../models/User');
const logger = require('../utils/logger');

class NotificationService {
  constructor() {
    this.fcmTokens = new Map(); // Cache for FCM tokens
  }

  /**
   * Send notification to a specific user
   * @param {string} userId - User ID
   * @param {Object} notification - Notification data
   * @param {Object} data - Additional data payload
   */
  async sendToUser(userId, notification, data = {}) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.fcmToken) {
        logger.warn('User not found or no FCM token', { userId });
        return { success: false, error: 'User not found or no FCM token' };
      }

      const message = {
        token: user.fcmToken,
        notification: {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || 'default',
          sound: notification.sound || 'default'
        },
        data: {
          type: notification.type || 'general',
          userId: userId.toString(),
          ...data
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            defaultSound: true,
            defaultVibrateTimings: true
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const result = await firebaseService.messaging.sendToDevice(user.fcmToken, message);

      logger.info('Notification sent successfully', {
        userId,
        messageId: result.messageId,
        type: notification.type
      });

      return { success: true, messageId: result.messageId };

    } catch (error) {
      logger.error('Error sending notification to user', {
        userId,
        error: error.message,
        stack: error.stack
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to multiple users
   * @param {Array<string>} userIds - Array of user IDs
   * @param {Object} notification - Notification data
   * @param {Object} data - Additional data payload
   */
  async sendToUsers(userIds, notification, data = {}) {
    try {
      const users = await User.find({ _id: { $in: userIds }, fcmToken: { $exists: true } });
      const tokens = users.map(user => user.fcmToken).filter(token => token);

      if (tokens.length === 0) {
        logger.warn('No valid FCM tokens found for users', { userIds });
        return { success: false, error: 'No valid FCM tokens found' };
      }

      const message = {
        tokens,
        notification: {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || 'default',
          sound: notification.sound || 'default'
        },
        data: {
          type: notification.type || 'general',
          ...data
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            defaultSound: true,
            defaultVibrateTimings: true
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const result = await firebaseService.messaging.sendToDevices(tokens, message);

      logger.info('Notifications sent to multiple users', {
        userCount: userIds.length,
        tokenCount: tokens.length,
        successCount: result.successCount,
        failureCount: result.failureCount,
        type: notification.type
      });

      return {
        success: true,
        successCount: result.successCount,
        failureCount: result.failureCount,
        results: result.responses
      };

    } catch (error) {
      logger.error('Error sending notifications to users', {
        userIds,
        error: error.message,
        stack: error.stack
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Send auction-related notifications
   */
  async sendAuctionNotification(auctionData) {
    const { type, animalId, animalName, bidderId, sellerId, amount, endTime } = auctionData;

    switch (type) {
      case 'bid_placed':
        // Notify seller about new bid
        await this.sendToUser(sellerId, {
          title: 'مزايدة جديدة!',
          body: `تم وضع مزايدة جديدة على ${animalName} بقيمة ${amount} دينار`,
          type: 'bid_placed'
        }, { animalId, amount });

        // Notify other bidders about being outbid
        const otherBidders = await this.getOtherBidders(animalId, bidderId);
        if (otherBidders.length > 0) {
          await this.sendToUsers(otherBidders, {
            title: 'تم تجاوز مزايدتك',
            body: `تم وضع مزايدة أعلى على ${animalName}`,
            type: 'outbid'
          }, { animalId, newBid: amount });
        }
        break;

      case 'auction_ended':
        // Notify winner
        await this.sendToUser(bidderId, {
          title: '🎉 فزت بالمزاد!',
          body: `تهانينا! فزت بـ ${animalName} بقيمة ${amount} دينار`,
          type: 'auction_won'
        }, { animalId, amount, isWinner: true });

        // Notify seller
        await this.sendToUser(sellerId, {
          title: 'انتهى مزادك',
          body: `انتهى مزاد ${animalName} بقيمة ${amount} دينار`,
          type: 'auction_ended'
        }, { animalId, finalAmount: amount });
        break;

      case 'auction_starting_soon':
        // Notify interested users about auction starting soon
        const interestedUsers = await this.getInterestedUsers(animalId);
        if (interestedUsers.length > 0) {
          await this.sendToUsers(interestedUsers, {
            title: 'سيبدأ المزاد قريباً',
            body: `سيبدأ مزاد ${animalName} خلال دقائق قليلة`,
            type: 'auction_starting'
          }, { animalId, startTime: endTime });
        }
        break;
    }
  }

  /**
   * Send payment-related notifications
   */
  async sendPaymentNotification(paymentData) {
    const { userId, type, amount, animalName } = paymentData;

    switch (type) {
      case 'payment_completed':
        await this.sendToUser(userId, {
          title: 'تم الدفع بنجاح',
          body: `تم تأكيد دفع ${amount} دينار لشراء ${animalName}`,
          type: 'payment_completed'
        }, { amount, animalName });
        break;

      case 'payment_failed':
        await this.sendToUser(userId, {
          title: 'فشل في الدفع',
          body: `فشل في معالجة الدفع بقيمة ${amount} دينار`,
          type: 'payment_failed'
        }, { amount });
        break;

      case 'funds_added':
        await this.sendToUser(userId, {
          title: 'تم إضافة الرصيد',
          body: `تم إضافة ${amount} دينار إلى رصيدك`,
          type: 'funds_added'
        }, { amount, newBalance: paymentData.newBalance });
        break;
    }
  }

  /**
   * Send general system notifications
   */
  async sendSystemNotification(userIds, notification) {
    if (typeof userIds === 'string') {
      userIds = [userIds];
    }

    await this.sendToUsers(userIds, {
      title: notification.title,
      body: notification.body,
      type: 'system'
    }, notification.data || {});
  }

  /**
   * Update user's FCM token
   * @param {string} userId - User ID
   * @param {string} fcmToken - FCM token
   */
  async updateUserToken(userId, fcmToken) {
    try {
      await User.findByIdAndUpdate(userId, { fcmToken });
      logger.info('FCM token updated for user', { userId });
      return { success: true };
    } catch (error) {
      logger.error('Error updating FCM token', { userId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Get other bidders for an animal (excluding current bidder)
   * @param {string} animalId - Animal ID
   * @param {string} excludeBidderId - Bidder to exclude
   */
  async getOtherBidders(animalId, excludeBidderId) {
    try {
      const bids = await require('../models/Bid').find({
        animalId,
        bidderId: { $ne: excludeBidderId }
      }).distinct('bidderId');

      return bids.map(id => id.toString());
    } catch (error) {
      logger.error('Error getting other bidders', { animalId, error: error.message });
      return [];
    }
  }

  /**
   * Get users interested in an animal (placeholder - implement based on your logic)
   * @param {string} animalId - Animal ID
   */
  async getInterestedUsers(animalId) {
    // This could be based on users who favorited the animal, followed the seller, etc.
    // For now, return empty array - implement based on your business logic
    return [];
  }

  /**
   * Send welcome notification to new users
   * @param {string} userId - User ID
   */
  async sendWelcomeNotification(userId) {
    await this.sendToUser(userId, {
      title: 'مرحباً بك في مزاد الحيوانات النادرة!',
      body: 'ابدأ في استكشاف أندر الحيوانات في العالم العربي',
      type: 'welcome'
    });
  }

  /**
   * Send verification code via SMS (placeholder - integrate with SMS service)
   * @param {string} phoneNumber - Phone number
   * @param {string} code - Verification code
   */
  async sendVerificationSMS(phoneNumber, code) {
    // TODO: Integrate with SMS service like Twilio, AWS SNS, or local provider
    logger.info(`[SMS] Verification code for ${phoneNumber}: ${code}`);

    // For development, you might want to send via email or other means
    // await emailService.sendVerificationCode(phoneNumber, code);
  }
}

module.exports = new NotificationService();