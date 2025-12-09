// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

let auth = null;
let isFirebaseAvailable = () => false;
let getFirebaseErrorMessage = (e) => e.message;

try {
  const firebaseModule = require('../config/firebase');
  auth = firebaseModule.auth;
  isFirebaseAvailable = firebaseModule.isFirebaseAvailable;
  getFirebaseErrorMessage = firebaseModule.getFirebaseErrorMessage;
} catch (error) {
  console.warn('Firebase not available:', error.message);
}

const AuthContext = createContext({});

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
  const [initializing, setInitializing] = useState(true);

  // مراقبة حالة المصادقة
  useEffect(() => {
    let unsubscribe = () => {};

    const initAuth = async () => {
      try {
        // تحميل المستخدم المحفوظ محلياً أولاً
        await loadStoredUser();

        // إذا كان Firebase متاحاً، راقب حالة المصادقة
        if (isFirebaseAvailable() && auth) {
          unsubscribe = auth.onAuthStateChanged(onAuthStateChanged);
        } else {
          console.log('🔄 Running in offline mode - using local storage only');
        }
      } catch (error) {
        console.log('❌ Auth initialization error:', error);
      } finally {
        setInitializing(false);
        setLoading(false);
      }
    };

    initAuth();

    return unsubscribe;
  }, []);

  // معالج تغيير حالة Firebase Auth
  const onAuthStateChanged = async (firebaseUser) => {
    try {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'مستخدم',
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          isDemo: false,
          loginMethod: 'firebase'
        };
        
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        console.log('✅ User authenticated via Firebase');
      } else {
        // لا تمسح المستخدم إذا كان تجريبي
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (!parsedUser.isDemo) {
            setUser(null);
            await AsyncStorage.removeItem('user');
          }
        }
      }
    } catch (error) {
      console.log('❌ Auth state change error:', error);
    } finally {
      setLoading(false);
    }
  };

  // تحميل المستخدم من التخزين المحلي
  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        console.log('📱 Loaded user from storage:', userData.email);
      }
    } catch (error) {
      console.log('❌ Error loading stored user:', error);
    }
  };

  // تسجيل دخول عادي
  const login = async (email, password) => {
    setLoading(true);
    
    try {
      if (isFirebaseAvailable() && auth) {
        // تسجيل دخول عبر Firebase
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('✅ Firebase login successful');
        return userCredential.user;
      } else {
        // تسجيل دخول تجريبي
        return await loginWithDemo(email, password);
      }
    } catch (error) {
      console.log('❌ Login error:', error);
      throw new Error(getFirebaseErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // تسجيل دخول تجريبي
  const loginWithDemo = async (email = 'demo@mazadzoo.com', password = 'demo123') => {
    setLoading(true);
    
    try {
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 1000));

      const demoUser = {
        uid: `demo-${Date.now()}`,
        email: email,
        displayName: 'مستخدم تجريبي',
        photoURL: null,
        emailVerified: true,
        isDemo: true,
        loginMethod: 'demo',
        loginTime: new Date().toISOString()
      };
      
      setUser(demoUser);
      await AsyncStorage.setItem('user', JSON.stringify(demoUser));
      
      console.log('🧪 Demo login successful');
      return demoUser;
    } catch (error) {
      console.log('❌ Demo login error:', error);
      throw new Error('فشل في إنشاء حساب تجريبي');
    } finally {
      setLoading(false);
    }
  };

  // إنشاء حساب جديد
  const register = async (email, password, displayName = '') => {
    setLoading(true);
    
    try {
      if (isFirebaseAvailable() && auth) {
        // تسجيل عبر Firebase
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // تحديث الملف الشخصي إذا تم توفير اسم
        if (displayName && userCredential.user.updateProfile) {
          await userCredential.user.updateProfile({ displayName });
        }
        
        console.log('✅ Firebase registration successful');
        return userCredential.user;
      } else {
        // تسجيل تجريبي
        const demoUser = {
          uid: `demo-${Date.now()}`,
          email: email,
          displayName: displayName || 'مستخدم جديد',
          photoURL: null,
          emailVerified: false,
          isDemo: true,
          loginMethod: 'demo-register',
          loginTime: new Date().toISOString()
        };
        
        setUser(demoUser);
        await AsyncStorage.setItem('user', JSON.stringify(demoUser));
        
        console.log('🧪 Demo registration successful');
        return demoUser;
      }
    } catch (error) {
      console.log('❌ Registration error:', error);
      throw new Error(getFirebaseErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // تسجيل خروج
  const logout = async () => {
    setLoading(true);
    
    try {
      // تسجيل خروج من Firebase إذا كان متاحاً
      if (isFirebaseAvailable() && auth && auth.currentUser) {
        await auth.signOut();
        console.log('✅ Firebase logout successful');
      }
      
      // مسح البيانات المحلية
      setUser(null);
      await AsyncStorage.removeItem('user');
      console.log('📱 Local data cleared');
    } catch (error) {
      console.log('❌ Logout error:', error);
      // حتى لو فشل Firebase، نقوم بتسجيل الخروج محلياً
      setUser(null);
      await AsyncStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  // دالة لإعادة تحميل بيانات المستخدم
  const refreshUser = async () => {
    if (isFirebaseAvailable() && auth && auth.currentUser) {
      await auth.currentUser.reload();
      onAuthStateChanged(auth.currentUser);
    }
  };

  // التحقق من حالة تسجيل الدخول
  const isLoggedIn = () => {
    return !!user;
  };

  // التحقق من نوع المستخدم
  const isUserDemo = () => {
    return user?.isDemo === true;
  };

  const value = {
    user,
    loading: loading || initializing,
    login,
    loginWithDemo,
    register,
    logout,
    refreshUser,
    isLoggedIn,
    isUserDemo,
    isFirebaseAvailable: isFirebaseAvailable(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;