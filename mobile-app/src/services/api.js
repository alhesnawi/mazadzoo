import { config } from '../config/environment.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockApiService } from './mockData.js';

const API_BASE_URL = config.API_BASE_URL;
const USE_MOCK_DATA = true; // Enable mock data fallback for all environments

class ApiService {
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async getToken() {
    if (!this.token) {
      this.token = await AsyncStorage.getItem('userToken');
    }
    return this.token;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const token = await this.getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };
  
    try {
      const response = await fetch(url, config);
      
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ في الخادم');
      }
  
      return data.data || data;
    } catch (error) {
      console.warn('API request failed:', endpoint, error.message);
      // If backend is not available, use mock data
      if (USE_MOCK_DATA) {
        console.log('Using mock data for:', endpoint);
        return this.handleMockRequest(endpoint, options);
      }
      throw error;
    }
  }

  async handleMockRequest(endpoint, options = {}) {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : null;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Route to appropriate mock function
    if (endpoint === '/animals' && method === 'GET') {
      return mockApiService.getAnimals();
    }
    if (endpoint.startsWith('/animals/') && method === 'GET' && !endpoint.includes('/')) {
      const id = endpoint.split('/')[2];
      return mockApiService.getAnimalById(id);
    }
    if (endpoint === '/animals/favorites' && method === 'GET') {
      return mockApiService.getFavorites();
    }
    if (endpoint === '/animals/favorites' && method === 'POST') {
      return mockApiService.addToFavorites(body.animalId);
    }
    if (endpoint.startsWith('/animals/favorites/') && method === 'DELETE') {
      const id = endpoint.split('/')[3];
      return mockApiService.removeFromFavorites(id);
    }
    if (endpoint === '/auth/login' && method === 'POST') {
      return mockApiService.login(body);
    }
    if (endpoint === '/auth/register' && method === 'POST') {
      return mockApiService.register(body);
    }
    if (endpoint === '/auth/profile' && method === 'GET') {
      return mockApiService.getCurrentUser();
    }
    if (endpoint === '/auth/profile' && method === 'PUT') {
      return mockApiService.updateProfile(body);
    }
    if (endpoint === '/bids/user' && method === 'GET') {
      return mockApiService.getUserBids();
    }
    if (endpoint === '/bids' && method === 'POST') {
      return mockApiService.placeBid(body.animalId, body.amount);
    }
    if (endpoint === '/notifications' && method === 'GET') {
      return mockApiService.getNotifications();
    }
    if (endpoint.startsWith('/notifications/') && endpoint.endsWith('/read') && method === 'PUT') {
      const id = endpoint.split('/')[2];
      return mockApiService.markNotificationAsRead(id);
    }
    if (endpoint === '/animals/categories' && method === 'GET') {
      return mockApiService.getCategories();
    }

    // Default fallback
    return { message: 'Mock endpoint not implemented', endpoint, method };
  }

  async uploadFile(endpoint, file, additionalData = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = await this.getToken();
    
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.fileName || 'image.jpg',
    });

    // Add additional data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ في رفع الملف');
      }

      return data.data || data;
    } catch (error) {
      throw error;
    }
  }

  // Auth methods
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async uploadProfileImage(imageFile) {
    return this.uploadFile('/auth/upload-avatar', imageFile);
  }

  async changePassword(passwordData) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(resetData) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(resetData),
    });
  }

  // Animals methods
  async getAnimals(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/animals?${queryString}`);
  }

  async getAnimalById(id) {
    return this.request(`/animals/${id}`);
  }

  async addAnimal(animalData) {
    return this.request('/animals', {
      method: 'POST',
      body: JSON.stringify(animalData),
    });
  }

  async uploadAnimalImages(animalId, images) {
    const formData = new FormData();
    
    images.forEach((image, index) => {
      formData.append('images', {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: `animal_${animalId}_${index}.jpg`,
      });
    });

    return this.uploadFile(`/animals/${animalId}/images`, null, formData);
  }

  async getFavoriteAnimals() {
    return this.request('/animals/favorites');
  }

  async addToFavorites(animalId) {
    return this.request('/animals/favorites', {
      method: 'POST',
      body: JSON.stringify({ animalId }),
    });
  }

  async removeFromFavorites(animalId) {
    return this.request(`/animals/favorites/${animalId}`, {
      method: 'DELETE',
    });
  }

  // Bids methods
  async placeBid(animalId, amount) {
    return this.request('/bids', {
      method: 'POST',
      body: JSON.stringify({ animalId, amount }),
    });
  }

  async getAnimalBids(animalId) {
    return this.request(`/bids/animal/${animalId}`);
  }

  async getUserBids() {
    return this.request('/bids/user');
  }

  async getBidHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/bids/history?${queryString}`);
  }

  // Payments methods
  async addFunds(amount, method) {
    return this.request('/payments/add-funds', {
      method: 'POST',
      body: JSON.stringify({ amount, method }),
    });
  }

  async getPaymentHistory() {
    return this.request('/payments/history');
  }

  async getWalletBalance() {
    return this.request('/payments/balance');
  }

  async withdrawFunds(amount, method) {
    return this.request('/payments/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, method }),
    });
  }

  // Notifications methods
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/mark-all-read', {
      method: 'PUT',
    });
  }

  async getNotificationSettings() {
    return this.request('/notifications/settings');
  }

  async updateNotificationSettings(settings) {
    return this.request('/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Search and filters
  async searchAnimals(query, filters = {}) {
    const params = { search: query, ...filters };
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/animals/search?${queryString}`);
  }

  async getCategories() {
    return this.request('/animals/categories');
  }

  // Statistics
  async getUserStats() {
    return this.request('/auth/stats');
  }

  async getAuctionStats(animalId) {
    return this.request(`/animals/${animalId}/stats`);
  }
}

export default new ApiService();

