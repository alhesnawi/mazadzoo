// Helper functions for the mobile app

// Format currency
export const formatCurrency = (amount, currency = 'LYD') => {
  return new Intl.NumberFormat('ar-LY', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount);
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
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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

// Get status color
export const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return '#22c55e'; // Green
    case 'pending':
      return '#eab308'; // Yellow
    case 'rejected':
      return '#ef4444'; // Red
    case 'ended':
      return '#6b7280'; // Gray
    case 'sold':
      return '#3b82f6'; // Blue
    default:
      return '#6b7280'; // Gray
  }
};

// Get status text
export const getStatusText = (status) => {
  switch (status) {
    case 'active':
      return 'نشط';
    case 'pending':
      return 'قيد الانتظار';
    case 'rejected':
      return 'مرفوض';
    case 'ended':
      return 'انتهى';
    case 'sold':
      return 'تم البيع';
    default:
      return 'غير معروف';
  }
};

// API error handler
export const handleApiError = (error) => {
  if (error.response) {
    return error.response.data?.message || 'حدث خطأ في الخادم';
  } else if (error.request) {
    return 'خطأ في الاتصال بالخادم';
  } else {
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

// Format number with commas
export const formatNumber = (number) => {
  return new Intl.NumberFormat('ar-LY').format(number);
};

// Get time ago
export const getTimeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) {
    return 'الآن';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `منذ ${diffInMinutes} دقيقة`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `منذ ${diffInHours} ساعة`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `منذ ${diffInDays} يوم`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `منذ ${diffInWeeks} أسبوع`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `منذ ${diffInMonths} شهر`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `منذ ${diffInYears} سنة`;
};
