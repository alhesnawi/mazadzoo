import { createContext, useContext, useState, useEffect } from 'react';
import { authService, socketService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (token) {
        const userData = await authService.getProfile();
        setUser(userData);
        // Connect to Socket.IO
        socketService.connect(token);
      }
    } catch (error) {
      // Auth check failed, clear user data
      localStorage.removeItem('userToken');
      socketService.disconnect();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authService.login(credentials);
      
      localStorage.setItem('userToken', response.token);
      setUser(response.user);
      
      // Connect to Socket.IO
      socketService.connect(response.token);
      
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authService.register(userData);
      
      localStorage.setItem('userToken', response.token);
      setUser(response.user);
      
      // Connect to Socket.IO
      socketService.connect(response.token);
      
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    setUser(null);
    setError(null);
    
    // Disconnect from Socket.IO
    socketService.disconnect();
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
