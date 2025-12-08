// Environment Configuration for Mobile App
const isDevelopment = process.env.NODE_ENV === 'development' || __DEV__ || false;

export const config = {
  // API Configuration
  // For Android emulator use: http://10.0.2.2:5000/api
  // For iOS simulator use: http://localhost:5000/api
  // For physical device use your computer's IP
  API_BASE_URL: isDevelopment 
    ? (process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api')
    : (process.env.EXPO_PUBLIC_API_URL || 'https://api.mazadzoo.online/api'),
  
  // App Configuration
  APP_NAME: 'مزاد الحيوانات النادرة',
  APP_VERSION: '1.0.0',
  
  // Feature Flags
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_REAL_TIME_BIDDING: true,
  ENABLE_OFFLINE_MODE: true,
  
  // Mobile Configuration
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Cache Configuration
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  
  // Development
  IS_DEVELOPMENT: isDevelopment,
  IS_PRODUCTION: !isDevelopment
};

// Debug logging
console.log('Environment Config:', {
  isDevelopment,
  API_BASE_URL: config.API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  __DEV__: typeof __DEV__ !== 'undefined' ? __DEV__ : 'undefined'
});
