import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/api';

// Create the AuthContext
const AuthContext = createContext({});

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in when app starts
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem('@user_data');
      const userToken = await AsyncStorage.getItem('@user_token');
      
      if (userData && userToken) {
        // Set token in ApiService
        ApiService.setToken(userToken);
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      
      // Use real API service
      const response = await ApiService.login(credentials);
      
      if (response && response.user && response.token) {
        // Save user data and token
        await AsyncStorage.setItem('@user_data', JSON.stringify(response.user));
        await AsyncStorage.setItem('@user_token', response.token);
        
        // Set token in ApiService
        ApiService.setToken(response.token);
        
        setUser(response.user);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        return { success: false, message: 'Invalid credentials' };
      }
    } catch (error) {
      console.log('Login error:', error);
      return { success: false, message: error.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      
      // Use real API service
      const response = await ApiService.register(userData);
      
      if (response && response.user && response.token) {
        // Save user data and token
        await AsyncStorage.setItem('@user_data', JSON.stringify(response.user));
        await AsyncStorage.setItem('@user_token', response.token);
        
        // Set token in ApiService
        ApiService.setToken(response.token);
        
        setUser(response.user);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        return { success: false, message: 'Registration failed' };
      }
    } catch (error) {
      console.log('Registration error:', error);
      return { success: false, message: error.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear stored data
      await AsyncStorage.removeItem('@user_data');
      await AsyncStorage.removeItem('@user_token');
      
      // Clear token from ApiService
      ApiService.setToken(null);
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;