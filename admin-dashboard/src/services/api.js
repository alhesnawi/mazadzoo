import config from '../config/environment.js';

// API Configuration
const API_BASE_URL = config.API_BASE_URL;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'حدث خطأ في الخادم');
  }
  
  return data.data || data;
};

// Auth Service
export const authService = {
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
  }
};

// Users Service
export const usersService = {
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/auth/users?${queryString}`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },

  async updateUserStatus(userId, status) {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isActive: status })
    });
    
    return handleResponse(response);
  },

  async deleteUser(userId) {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
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

  async approveAnimal(animalId) {
    const response = await fetch(`${API_BASE_URL}/animals/${animalId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },

  async rejectAnimal(animalId, reason) {
    const response = await fetch(`${API_BASE_URL}/animals/${animalId}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    
    return handleResponse(response);
  },

  async startAuction(animalId) {
    const response = await fetch(`${API_BASE_URL}/animals/${animalId}/start-auction`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },

  async endAuction(animalId) {
    const response = await fetch(`${API_BASE_URL}/animals/${animalId}/end-auction`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  }
};

// Bids Service
export const bidsService = {
  async getBids(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/bids?${queryString}`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },

  async getAnimalBids(animalId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/bids/animal/${animalId}?${queryString}`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  }
};

// Payments Service
export const paymentsService = {
  async getPayments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/payments/history?${queryString}`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },

  async processRefund(paymentId, reason) {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    
    return handleResponse(response);
  },

  async getPaymentStats() {
    const response = await fetch(`${API_BASE_URL}/payments/stats`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  }
};

// Dashboard Service
export const dashboardService = {
  async getStats() {
    try {
      // Get various statistics
      const [usersStats, animalsStats, paymentsStats] = await Promise.all([
        usersService.getUsers({ limit: 1 }),
        animalsService.getAnimals({ limit: 1 }),
        paymentsService.getPaymentStats()
      ]);

      return {
        totalUsers: usersStats.pagination?.total || 0,
        totalAnimals: animalsStats.pagination?.total || 0,
        totalRevenue: paymentsStats.stats?.totalEarned || 0,
        activeAuctions: animalsStats.animals?.filter(a => a.status === 'active').length || 0
      };
    } catch {
      // Handle dashboard stats fetch error
      return {
        totalUsers: 0,
        totalAnimals: 0,
        totalRevenue: 0,
        activeAuctions: 0
      };
    }
  },

  async getRecentActivity() {
    try {
      // Get recent animals and payments
      const [recentAnimals, recentPayments] = await Promise.all([
        animalsService.getAnimals({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
        paymentsService.getPayments({ limit: 5 })
      ]);

      const activities = [];

      // Add recent animals
      recentAnimals.animals?.forEach(animal => {
        activities.push({
          id: `animal-${animal._id}`,
          type: 'animal',
          message: `تم إضافة حيوان جديد: ${animal.name}`,
          timestamp: animal.createdAt,
          status: animal.status
        });
      });

      // Add recent payments
      recentPayments.payments?.forEach(payment => {
        activities.push({
          id: `payment-${payment._id}`,
          type: 'payment',
          message: `معاملة مالية: ${payment.description}`,
          timestamp: payment.createdAt,
          amount: payment.amount
        });
      });

      // Sort by timestamp
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return activities.slice(0, 10);
    } catch {
      // Handle recent activity fetch error
      return [];
    }
  }
};

