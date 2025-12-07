import { io } from 'socket.io-client';
import config from '../config/environment.js';

// API Configuration
const API_BASE_URL = config.API_BASE_URL;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('userToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  try {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'حدث خطأ في الخادم');
    }

    // If the API returns a token at the top level (e.g. on login/register),
    // include it alongside the returned data so callers can access it.
    if (data && data.token) {
      return Object.assign({}, data.data || {}, { token: data.token });
    }

    return data.data || data;
  } catch (error) {
    if (error.name === 'SyntaxError') {
      throw new Error('استجابة غير صحيحة من الخادم');
    }
    throw error;
  }
};

// Helper function to handle network errors
const handleNetworkError = (error) => {
  if (!navigator.onLine) {
    throw new Error('لا يوجد اتصال بالإنترنت');
  }
  throw new Error('خطأ في الاتصال بالخادم');
};

// Auth Service
export const authService = {
  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    return handleResponse(response);
  },

  async login(credentials) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    return handleResponse(response);
  },

  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },

  async updateProfile(profileData) {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    
    return handleResponse(response);
  }
};

// Animals Service
export const animalsService = {
  async getAnimals(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/animals?${queryString}`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },

  async getAnimal(animalId) {
    const response = await fetch(`${API_BASE_URL}/animals/${animalId}`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },

  async createAnimal(animalData) {
    const response = await fetch(`${API_BASE_URL}/animals`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(animalData)
    });
    
    return handleResponse(response);
  },

  async updateAnimal(animalId, animalData) {
    const response = await fetch(`${API_BASE_URL}/animals/${animalId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(animalData)
    });
    
    return handleResponse(response);
  },

  async deleteAnimal(animalId) {
    const response = await fetch(`${API_BASE_URL}/animals/${animalId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  }
};

// Bids Service
export const bidsService = {
  async getBids(animalId) {
    const response = await fetch(`${API_BASE_URL}/bids/animal/${animalId}`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },

  async placeBid(animalId, bidAmount) {
    const response = await fetch(`${API_BASE_URL}/bids`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        animalId,
        amount: bidAmount
      })
    });
    
    return handleResponse(response);
  },

  async getUserBids() {
    const response = await fetch(`${API_BASE_URL}/bids/user`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  }
};

// Payments Service
export const paymentsService = {
  async getWallet() {
    const response = await fetch(`${API_BASE_URL}/payments/wallet`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },

  async addFunds(amount) {
    const response = await fetch(`${API_BASE_URL}/payments/add-funds`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount })
    });
    
    return handleResponse(response);
  },

  async getPaymentHistory() {
    const response = await fetch(`${API_BASE_URL}/payments/history`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },

  async buyNow(animalId) {
    const response = await fetch(`${API_BASE_URL}/payments/buy-now`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ animalId })
    });
    
    return handleResponse(response);
  }
};

// Notifications Service
export const notificationsService = {
  async getNotifications() {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },

  async markAsRead(notificationId) {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },

  async markAllAsRead() {
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  }
};

// Socket.IO Service for real-time updates
export const socketService = {
  socket: null,
  
  connect(token) {
    if (this.socket) {
      this.socket.disconnect();
    }
    
    this.socket = io(config.SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });
    
    this.socket.on('connect', () => {
      // Socket connected successfully
    });
    
    this.socket.on('disconnect', () => {
      // Socket disconnected
    });
    
    this.socket.on('connect_error', (error) => {
      // Handle connection error silently or show user-friendly message
    });
    
    return this.socket;
  },
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  },
  
  joinAuction(animalId) {
    if (this.socket) {
      this.socket.emit('join-auction', animalId);
    }
  },
  
  leaveAuction(animalId) {
    if (this.socket) {
      this.socket.emit('leave-auction', animalId);
    }
  },
  
  placeBid(animalId, bidAmount) {
    if (this.socket) {
      this.socket.emit('place-bid', { animalId, bidAmount });
    }
  },
  
  onNewBid(callback) {
    if (this.socket) {
      this.socket.on('new-bid', callback);
    }
  },
  
  onBidSuccess(callback) {
    if (this.socket) {
      this.socket.on('bid-success', callback);
    }
  },
  
  onBidError(callback) {
    if (this.socket) {
      this.socket.on('bid-error', callback);
    }
  },
  
  onAuctionTimeUpdate(callback) {
    if (this.socket) {
      this.socket.on('auction-time-update', callback);
    }
  },
  
  onAuctionEnded(callback) {
    if (this.socket) {
      this.socket.on('auction-ended', callback);
    }
  },
  
  onOutbidNotification(callback) {
    if (this.socket) {
      this.socket.on('outbid-notification', callback);
    }
  }
};

// File Upload Service
export const uploadService = {
  async uploadImage(file, type = 'animal') {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    
    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
      },
      body: formData
    });
    
    return handleResponse(response);
  },
  
  async uploadMultipleImages(files, type = 'animal') {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('images', file);
    });
    formData.append('type', type);
    
    const response = await fetch(`${API_BASE_URL}/upload/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
      },
      body: formData
    });
    
    return handleResponse(response);
  }
};

// Search Service
export const searchService = {
  async searchAnimals(query, filters = {}) {
    const params = new URLSearchParams({
      q: query,
      ...filters
    });
    
    const response = await fetch(`${API_BASE_URL}/animals/search?${params}`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },
  
  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/animals/categories`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },
  
  async getPopularAnimals() {
    const response = await fetch(`${API_BASE_URL}/animals/popular`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  }
};

// Analytics Service
export const analyticsService = {
  async getAuctionStats() {
    const response = await fetch(`${API_BASE_URL}/analytics/auction-stats`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },
  
  async getUserStats() {
    const response = await fetch(`${API_BASE_URL}/analytics/user-stats`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  }
};
