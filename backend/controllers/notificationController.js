const notificationService = require('../services/notificationService');
const { sendResponse, sendError } = require('../utils/helpers');
const logger = require('../utils/logger');

// @desc    Update FCM token for user
// @route   POST /api/notifications/fcm-token
// @access  Private
const updateFcmToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user.id;

    if (!fcmToken) {
      return sendError(res, 400, 'FCM token مطلوب');
    }

    const result = await notificationService.updateUserToken(userId, fcmToken);

    if (result.success) {
      sendResponse(res, 200, true, 'تم تحديث رمز FCM بنجاح');
    } else {
      sendError(res, 500, 'فشل في تحديث رمز FCM');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Send test notification
// @route   POST /api/notifications/test
// @access  Private
const sendTestNotification = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await notificationService.sendToUser(userId, {
      title: 'إشعار تجريبي',
      body: 'هذا إشعار تجريبي للتأكد من عمل الإشعارات',
      type: 'test'
    });

    if (result.success) {
      sendResponse(res, 200, true, 'تم إرسال الإشعار التجريبي بنجاح', {
        messageId: result.messageId
      });
    } else {
      sendError(res, 500, 'فشل في إرسال الإشعار التجريبي: ' + result.error);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's notification preferences
// @route   GET /api/notifications/preferences
// @access  Private
const getNotificationPreferences = async (req, res, next) => {
  try {
    // For now, return default preferences
    // In a real implementation, you would store user preferences in the database
    const preferences = {
      bidNotifications: true,
      auctionEndNotifications: true,
      paymentNotifications: true,
      systemNotifications: true,
      marketingNotifications: false
    };

    sendResponse(res, 200, true, 'تم جلب تفضيلات الإشعارات بنجاح', { preferences });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user's notification preferences
// @route   PUT /api/notifications/preferences
// @access  Private
const updateNotificationPreferences = async (req, res, next) => {
  try {
    const { bidNotifications, auctionEndNotifications, paymentNotifications, systemNotifications, marketingNotifications } = req.body;

    // For now, just validate and return success
    // In a real implementation, you would save these to the database
    const preferences = {
      bidNotifications: bidNotifications ?? true,
      auctionEndNotifications: auctionEndNotifications ?? true,
      paymentNotifications: paymentNotifications ?? true,
      systemNotifications: systemNotifications ?? true,
      marketingNotifications: marketingNotifications ?? false
    };

    sendResponse(res, 200, true, 'تم تحديث تفضيلات الإشعارات بنجاح', { preferences });
  } catch (error) {
    next(error);
  }
};

// @desc    Send system notification to all users (Admin only)
// @route   POST /api/notifications/broadcast
// @access  Private (Admin)
const broadcastNotification = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return sendError(res, 403, 'غير مصرح لك بإرسال إشعارات جماعية');
    }

    const { title, body, userIds } = req.body;

    if (!title || !body) {
      return sendError(res, 400, 'العنوان والمحتوى مطلوبان');
    }

    const result = await notificationService.sendSystemNotification(userIds || [], {
      title,
      body,
      type: 'broadcast'
    });

    sendResponse(res, 200, true, 'تم إرسال الإشعار الجماعي بنجاح', result);
  } catch (error) {
    next(error);
  }
};

// Validation rules
const updateFcmTokenValidation = [
  // Add validation if needed
];

const sendTestNotificationValidation = [
  // Add validation if needed
];

const updatePreferencesValidation = [
  // Add validation if needed
];

const broadcastValidation = [
  // Add validation if needed
];

module.exports = {
  updateFcmToken,
  sendTestNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  broadcastNotification,
  updateFcmTokenValidation,
  sendTestNotificationValidation,
  updatePreferencesValidation,
  broadcastValidation
};