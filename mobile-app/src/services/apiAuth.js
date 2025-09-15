import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from './api';

class ApiAuthService {
  // تسجيل حساب جديد
  async register(userData) {
    try {
      const response = await ApiService.register(userData);
      
      if (response.token) {
        await AsyncStorage.setItem('userToken', response.token);
        ApiService.setToken(response.token);
      }
      
      return {
        user: response.user,
        token: response.token,
      };
    } catch (error) {
      throw new Error(error.message || 'فشل إنشاء الحساب / Registration failed');
    }
  }

  // تسجيل الدخول
  async login(credentials) {
    try {
      const response = await ApiService.login(credentials);
      
      if (response.token) {
        await AsyncStorage.setItem('userToken', response.token);
        ApiService.setToken(response.token);
      }
      
      return {
        user: response.user,
        token: response.token,
      };
    } catch (error) {
      throw new Error(error.message || 'فشل تسجيل الدخول / Login failed');
    }
  }

  // تسجيل الخروج
  async logout() {
    try {
      await AsyncStorage.removeItem('userToken');
      ApiService.setToken(null);
    } catch (error) {
      throw new Error('فشل تسجيل الخروج / Logout failed');
    }
  }

  // الحصول على الملف الشخصي
  async getProfile() {
    try {
      return await ApiService.getProfile();
    } catch (error) {
      throw new Error('فشل جلب بيانات المستخدم / Failed to fetch user data');
    }
  }

  // تحديث الملف الشخصي
  async updateProfile(profileData) {
    try {
      return await ApiService.updateProfile(profileData);
    } catch (error) {
      throw new Error('فشل تحديث الملف الشخصي / Profile update failed');
    }
  }

  // التحقق من وجود مستخدم مسجل
  async getCurrentUser() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        ApiService.setToken(token);
        return await this.getProfile();
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // الحصول على التوكن
  async getToken() {
    return await AsyncStorage.getItem('userToken');
  }
}

export default new ApiAuthService();