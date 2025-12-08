// Helper functions for the auction frontend

// Format currency
export const formatCurrency = (amount, currency = 'LYD') => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0
  }).format(amount);
  return `${formatted} د.ل`;
};

// Format date
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('ar-LY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

// Format time remaining
export const formatTimeRemaining = (endTime) => {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end - now;

  if (diff <= 0) {
    return 'انتهى';
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) {
    return `${days} يوم ${hours} ساعة`;
  } else if (hours > 0) {
    return `${String(hours)}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  } else {
    return `${String(minutes)}:${String(seconds).padStart(2, '0')}`;
  }
};

// Validate email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate phone number
export const validatePhone = (phone) => {
  const re = /^(\+218|218|0)?[0-9]{9}$/;
  return re.test(phone);
};

// Validate password strength
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    errors: {
      length: password.length < minLength,
      uppercase: !hasUpperCase,
      lowercase: !hasLowerCase,
      numbers: !hasNumbers,
      special: !hasSpecialChar
    }
  };
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Local storage helpers
export const storage = {
  get: (key) => {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (error) {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
    // Handle localStorage error silently
  }
  },
  remove: (key) => {
    localStorage.removeItem(key);
  },
  clear: () => {
    localStorage.clear();
  }
};

// API error handler
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    return error.response.data?.message || 'حدث خطأ في الخادم';
  } else if (error.request) {
    // Network error
    return 'خطأ في الاتصال بالخادم';
  } else {
    // Other error
    return error.message || 'حدث خطأ غير متوقع';
  }
};

// Image optimization
export const optimizeImageUrl = (url, width = 400, height = 300) => {
  if (!url) return '';
  
  // If it's an external URL (like Unsplash), add optimization parameters
  if (url.includes('unsplash.com')) {
    return `${url}?w=${width}&h=${height}&fit=crop`;
  }
  
  return url;
};

// Auction status helper
export const getAuctionStatus = (animal) => {
  if (!animal) return 'unknown';
  
  if (animal.status === 'pending') return 'pending';
  if (animal.status === 'rejected') return 'rejected';
  if (animal.status === 'ended') return 'ended';
  if (animal.status === 'sold') return 'sold';
  
  // Check if auction has ended
  if (animal.auctionEndTime && new Date() > new Date(animal.auctionEndTime)) {
    return 'ended';
  }
  
  return 'active';
};

// Bid validation
export const validateBid = (amount, currentBid, minIncrement = 1) => {
  const numAmount = parseFloat(amount);
  const numCurrentBid = parseFloat(currentBid);
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return { isValid: false, message: 'يجب أن تكون المزايدة رقم موجب' };
  }
  
  if (numAmount <= numCurrentBid) {
    return { isValid: false, message: 'يجب أن تكون المزايدة أكبر من المزايدة الحالية' };
  }
  
  const increment = numAmount - numCurrentBid;
  if (increment < minIncrement) {
    return { isValid: false, message: `يجب أن تكون الزيادة على الأقل ${minIncrement} دينار ليبي` };
  }
  
  return { isValid: true, message: '' };
};
