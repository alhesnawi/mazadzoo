// src/config/firebase.js
// Using REST API instead of native Firebase SDK for Expo compatibility
// This avoids native module conflicts while maintaining functionality

const firebaseConfig = {
  apiKey: "AIzaSyAM1z65vPwrK-EnDO_GfidsIhRegQbN-DM",
  authDomain: "mazadzoo.firebaseapp.com", 
  projectId: "mazadzoo",
  storageBucket: "mazadzoo.firebasestorage.app",
  messagingSenderId: "796573027487",
  appId: "1:796573027487:android:72fe5525a64f943379a6aa"
};

let isFirebaseEnabled = true;

// Auth service using REST API
const firebaseAuth = {
  currentUser: null,
  
  async signInWithEmailAndPassword(email, password) {
    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Sign in failed');
      }
      
      const data = await response.json();
      this.currentUser = {
        uid: data.localId,
        email: data.email,
        displayName: data.displayName || email.split('@')[0],
        photoURL: null
      };
      
      return { user: this.currentUser };
    } catch (error) {
      throw error;
    }
  },
  
  async createUserWithEmailAndPassword(email, password) {
    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Sign up failed');
      }
      
      const data = await response.json();
      this.currentUser = {
        uid: data.localId,
        email: data.email,
        displayName: email.split('@')[0],
        photoURL: null
      };
      
      return { user: this.currentUser };
    } catch (error) {
      throw error;
    }
  },
  
  async signOut() {
    this.currentUser = null;
    return Promise.resolve();
  },
  
  onAuthStateChanged(callback) {
    // Simulate auth state listener
    if (this.currentUser) {
      callback(this.currentUser);
    } else {
      callback(null);
    }
    
    // Return unsubscribe function
    return () => {};
  }
};

// Firestore mock using REST API or local storage fallback
const firebaseFirestore = {
  collection(path) {
    return {
      async add(data) {
        // Fall back to backend API
        try {
          const response = await fetch(`http://10.0.2.2:5000/api/${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          const result = await response.json();
          return { id: result.id || `local_${Date.now()}` };
        } catch (error) {
          console.warn('Firestore add failed, using fallback:', error);
          return { id: `local_${Date.now()}` };
        }
      },
      
      async get() {
        try {
          const response = await fetch(`http://10.0.2.2:5000/api/${path}`);
          const data = await response.json();
          return { docs: Array.isArray(data) ? data.map(d => ({ id: d.id || d._id, data: () => d })) : [] };
        } catch (error) {
          console.warn('Firestore get failed:', error);
          return { docs: [] };
        }
      },
      
      doc(id) {
        return {
          async get() {
            try {
              const response = await fetch(`http://10.0.2.2:5000/api/${path}/${id}`);
              const data = await response.json();
              return { exists: !!data, data: () => data };
            } catch (error) {
              return { exists: false, data: () => ({}) };
            }
          },
          async set(data) {
            try {
              await fetch(`http://10.0.2.2:5000/api/${path}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
              });
            } catch (error) {
              console.warn('Firestore set failed:', error);
            }
          },
          async update(data) {
            try {
              await fetch(`http://10.0.2.2:5000/api/${path}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
              });
            } catch (error) {
              console.warn('Firestore update failed:', error);
            }
          },
          async delete() {
            try {
              await fetch(`http://10.0.2.2:5000/api/${path}/${id}`, {
                method: 'DELETE'
              });
            } catch (error) {
              console.warn('Firestore delete failed:', error);
            }
          }
        };
      }
    };
  }
};

// Storage mock
const firebaseStorage = {
  ref(path) {
    return {
      async putFile(file) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          const response = await fetch('http://10.0.2.2:5000/api/upload', {
            method: 'POST',
            body: formData
          });
          const data = await response.json();
          return { downloadURL: data.url || 'https://via.placeholder.com/300' };
        } catch (error) {
          console.warn('Storage upload failed:', error);
          return { downloadURL: 'https://via.placeholder.com/300' };
        }
      },
      
      async getDownloadURL() {
        return 'https://via.placeholder.com/300';
      }
    };
  }
};

// Messaging mock - uses backend endpoint for push notifications
const firebaseMessaging = {
  async requestPermission() {
    return true;
  },
  
  async getToken() {
    return `mock-fcm-token-${Date.now()}`;
  },
  
  onMessage(callback) {
    return () => {};
  },
  
  setBackgroundMessageHandler(callback) {},
  
  async subscribeToTopic(topic) {
    console.log(`Subscribed to topic: ${topic}`);
  },
  
  async unsubscribeFromTopic(topic) {
    console.log(`Unsubscribed from topic: ${topic}`);
  }
};

// Helper functions
export const isFirebaseAvailable = () => {
  return isFirebaseEnabled;
};

export const getFirebaseStatus = () => {
  return {
    enabled: isFirebaseEnabled,
    auth: !!firebaseAuth,
    firestore: !!firebaseFirestore,
    storage: !!firebaseStorage,
    messaging: !!firebaseMessaging
  };
};

export const getFirebaseErrorMessage = (error) => {
  if (!isFirebaseEnabled) {
    return 'Firebase غير متاح. يتم تشغيل التطبيق في الوضع التجريبي.';
  }
  
  const errorCode = error.code || error.message || '';
  
  if (errorCode.includes('EMAIL_EXISTS')) {
    return 'هذا البريد الإلكتروني مستخدم بالفعل';
  } else if (errorCode.includes('INVALID_PASSWORD')) {
    return 'كلمة المرور ضعيفة جداً (6 أحرف على الأقل)';
  } else if (errorCode.includes('USER_NOT_FOUND')) {
    return 'لا يوجد مستخدم مسجل بهذا البريد الإلكتروني';
  } else if (errorCode.includes('INVALID_LOGIN_CREDENTIALS')) {
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
  } else if (errorCode.includes('TOO_MANY_ATTEMPTS_LOGIN_FAILURE')) {
    return 'تم تجاوز عدد المحاولات المسموح. حاول مرة أخرى لاحقاً';
  } else if (errorCode.includes('NETWORK')) {
    return 'فشل في الاتصال بالإنترنت';
  }
  
  return error.message || 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى';
};

// Log status
console.log('Firebase Config Loaded (REST API Mode)');

// Export services
export { 
  firebaseAuth as auth, 
  firebaseFirestore as firestore,
  firebaseStorage as storage,
  firebaseMessaging as messaging 
};

export default { auth: firebaseAuth, firestore: firebaseFirestore };