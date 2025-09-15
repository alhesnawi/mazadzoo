import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from './api';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  async initialize() {
    try {
      // Request permissions
      const { status } = await this.requestPermissions();
      
      if (status === 'granted') {
        // Get push token
        const token = await this.getPushToken();
        
        if (token) {
          this.expoPushToken = token;
          
          // Send token to backend
          await this.registerPushToken(token);
          
          // Set up listeners
          this.setupNotificationListeners();
        }
      }
    } catch (error) {
      // Handle notification initialization error
    }
  }

  async requestPermissions() {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      return { status: finalStatus };
    } else {
      return { status: 'granted' }; // For simulator
    }
  }

  async getPushToken() {
    try {
      if (Device.isDevice) {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: 'your-expo-project-id', // Replace with your actual project ID
        });
        return token.data;
      } else {
        // Physical device required for Push Notifications
        return null;
      }
    } catch (error) {
      // Handle push token error
      return null;
    }
  }

  async registerPushToken(token) {
    try {
      await ApiService.request('/auth/register-push-token', {
        method: 'POST',
        body: JSON.stringify({ pushToken: token }),
      });
      
      // Store token locally
      await AsyncStorage.setItem('expoPushToken', token);
    } catch (error) {
      // Handle token registration error
    }
  }

  setupNotificationListeners() {
    // Listener for notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      this.handleNotificationReceived(notification);
    });

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      this.handleNotificationResponse(response);
    });
  }

  handleNotificationReceived(notification) {
    // Handle notification received while app is active
    const { title, body, data } = notification.request.content;
    
    // You can add custom logic here based on notification type
    if (data?.type === 'new_bid') {
      // Handle new bid notification
    } else if (data?.type === 'auction_ending') {
      // Handle auction ending notification
    }
  }

  handleNotificationResponse(response) {
    // Handle notification tap
    const { data } = response.notification.request.content;
    
    // Navigate to appropriate screen based on notification data
    if (data?.animalId) {
      // Navigate to animal detail screen
      // This would need to be implemented with navigation ref
    }
  }

  async scheduleLocalNotification(title, body, data = {}, trigger = null) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: trigger || null, // null means immediate
      });
    } catch (error) {
      // Handle notification scheduling error
    }
  }

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      // Handle notification cancellation error
    }
  }

  async clearNotifications() {
    try {
      await Notifications.dismissAllNotificationsAsync();
      await this.cancelAllNotifications();
    } catch (error) {
      // Handle notification clearing error
    }
  }

  async setBadgeCount(count) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      // Handle badge count error
    }
  }

  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export default new NotificationService();