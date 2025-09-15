// Environment Configuration
export const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5002/api',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5002',
  
  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'مزاد الحيوانات النادرة',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Feature Flags
  ENABLE_SOCKET: import.meta.env.VITE_ENABLE_SOCKET === 'true',
  ENABLE_REAL_TIME_BIDDING: import.meta.env.VITE_ENABLE_REAL_TIME_BIDDING === 'true',
  ENABLE_NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  
  // Upload Configuration
  MAX_FILE_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 5242880, // 5MB
  ALLOWED_FILE_TYPES: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png', 
    'image/webp'
  ],
  
  // Analytics
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  
  // Development
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD
};

// Validate required environment variables
export const validateEnvironment = () => {
  const required = ['API_BASE_URL', 'SOCKET_URL'];
  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0) {
  // Missing environment variables detected
  // In production, handle this appropriately
}
  
  return missing.length === 0;
};

export default config;
