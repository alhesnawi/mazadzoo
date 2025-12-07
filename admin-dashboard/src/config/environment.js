// Environment Configuration for Admin Dashboard
export const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_URL || '/api',
  
  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'لوحة إدارة مزاد الحيوانات النادرة',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Feature Flags
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_REAL_TIME_UPDATES: import.meta.env.VITE_ENABLE_REAL_TIME_UPDATES === 'true',
  
  // Admin Configuration
  ADMIN_ROLES: ['admin', 'super_admin'],
  DEFAULT_PAGE_SIZE: 10,
  
  // Development
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD
};

// Validate required environment variables
export const validateEnvironment = () => {
  const required = ['API_BASE_URL'];
  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0) {
  // Missing environment variables detected
  // In production, handle this appropriately
}
  
  return missing.length === 0;
};

export default config;
