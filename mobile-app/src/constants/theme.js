export const COLORS = {
  // Brand Colors
  primary: '#3B82F6',      // Blue
  secondary: '#F59E0B',    // Gold
  accent: '#F59E0B',       // Gold accent
  
  // Background Colors
  background: '#FFFFFF',   // White
  surface: '#F9FAFB',      // Light gray
  card: '#FFFFFF',         // White
  
  // Text Colors
  text: '#111827',         // Dark gray
  textSecondary: '#6B7280', // Medium gray
  textLight: '#9CA3AF',    // Light gray
  white: '#FFFFFF',        // White
  black: '#000000',        // Black
  gray: '#6B7280',         // Gray
  
  // Border Colors
  border: '#E5E7EB',       // Light border
  borderLight: '#F3F4F6',  // Very light border
  
  // Status Colors
  success: '#10B981',      // Green
  warning: '#F59E0B',      // Amber
  error: '#EF4444',        // Red
  info: '#3B82F6',         // Blue
  
  // Additional missing colors
  lightGray: '#F3F4F6',    // Light gray
  lightGray2: '#E5E7EB',   // Lighter gray
  disabled: '#9CA3AF',     // Disabled state
  
  // Transparent Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  backdrop: 'rgba(0, 0, 0, 0.3)',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',  // Add missing semiBold
  bold: 'System',
};

export const SIZES = {
  // Global sizes
  base: 8,
  font: 14,
  radius: 8,
  padding: 16,
  margin: 16,

  // Font sizes
  largeTitle: 32,
  h1: 28,
  h2: 24,
  h3: 20,
  h4: 18,
  body1: 16,
  body2: 14,
  body3: 12,
  body4: 11,        // Add missing body4
  body5: 10,        // Add missing body5
  caption: 10,

  // App dimensions
  width: 375,
  height: 812,
};

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  heavy: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Alternative exports for compatibility
export const colors = COLORS;
export const typography = {
  sizes: {
    xs: SIZES.caption,
    sm: SIZES.body3,
    md: SIZES.body2,
    lg: SIZES.body1,
    xl: SIZES.h4,
    xxl: SIZES.h3,
  },
  weights: {
    regular: 'normal',
    medium: '500',
    semibold: '600',
    bold: 'bold',
  },
};
export const spacing = {
  xs: SIZES.base / 2,
  sm: SIZES.base,
  md: SIZES.base * 2,
  lg: SIZES.base * 3,
  xl: SIZES.base * 4,
};

// Default export for compatibility
export default {
  COLORS,
  FONTS,
  SIZES,
  SHADOWS,
  colors,
  typography,
  spacing,
};

