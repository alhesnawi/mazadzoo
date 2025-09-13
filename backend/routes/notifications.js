const express = require('express');
const {
  updateFcmToken,
  sendTestNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  broadcastNotification,
  updateFcmTokenValidation,
  sendTestNotificationValidation,
  updatePreferencesValidation,
  broadcastValidation
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// FCM token management
router.post('/fcm-token', updateFcmTokenValidation, updateFcmToken);

// Notification preferences
router.get('/preferences', getNotificationPreferences);
router.put('/preferences', updatePreferencesValidation, updateNotificationPreferences);

// Test notifications
router.post('/test', sendTestNotificationValidation, sendTestNotification);

// Admin routes
router.post('/broadcast', authorize('admin'), broadcastValidation, broadcastNotification);

module.exports = router;