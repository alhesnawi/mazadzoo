// src/config/firebase.js
import { initializeApp, getApps } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';

// Firebase configuration باستخدام بياناتك من google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyAM1z65vPwrK-EnDO_GfidsIhRegQbN-DM",
  authDomain: "mazadzoo.firebaseapp.com", 
  projectId: "mazadzoo",
  storageBucket: "mazadzoo.firebasestorage.app",
  messagingSenderId: "796573027487",
  appId: "1:796573027487:android:72fe5525a64f943379a6aa"
};

let app;
let firebaseAuth = null;
let firebaseFirestore = null;
let firebaseStorage = null;
let firebaseMessaging = null;
let isFirebaseEnabled = false;

try {
  // تحقق من عدم تكرار التهيئة
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } else {
    app = getApps()[0];
    console.log('Firebase already initialized');
  }
  
  // تهيئة خدمات Firebase
  firebaseAuth = auth();
  firebaseFirestore = firestore();
  firebaseStorage = storage();
  firebaseMessaging = messaging();
  
  isFirebaseEnabled = true;
  console.log('Firebase services initialized successfully');
  
} catch (error) {
  console.warn('Firebase initialization failed:', error.message);
  console.warn('App will run in offline/demo mode');
  
  isFirebaseEnabled = false;
  
  // إنشاء mock objects للعمل بدون Firebase
  firebaseAuth = createAuthMock();
  firebaseFirestore = createFirestoreMock();
  firebaseStorage = createStorageMock();
  firebaseMessaging = createMessagingMock();
}

// إنشاء Mock للمصادقة
function createAuthMock() {
  return {
    currentUser: null,
    signInWithEmailAndPassword: (email, password) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (email === 'demo@mazadzoo.com' && password === 'demo123') {
            resolve({
              user: {
                uid: 'demo-user-123',
                email: email,
                displayName: 'مستخدم تجريبي',
                photoURL: null
              }
            });
          } else {
            reject(new Error('auth/user-not-found'));
          }
        }, 1000);
      });
    },
    createUserWithEmailAndPassword: (email, password) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            user: {
              uid: `demo-${Date.now()}`,
              email: email,
              displayName: 'مستخدم جديد',
              photoURL: null
            }
          });
        }, 1000);
      });
    },
    signOut: () => Promise.resolve(),
    onAuthStateChanged: (callback) => {
      // إرجاع دالة إلغاء الاشتراك
      return () => {};
    }
  };
}

// إنشاء Mock لقاعدة البيانات
function createFirestoreMock() {
  return {
    collection: (path) => ({
      add: (data) => Promise.resolve({ id: `mock_${Date.now()}` }),
      get: () => Promise.resolve({ docs: [] }),
      doc: (id) => ({
        get: () => Promise.resolve({ exists: false }),
        set: (data) => Promise.resolve(),
        update: (data) => Promise.resolve(),
        delete: () => Promise.resolve()
      })
    })
  };
}

// إنشاء Mock للتخزين
function createStorageMock() {
  return {
    ref: (path) => ({
      putFile: () => Promise.resolve({ downloadURL: 'https://example.com/mock-image.jpg' }),
      getDownloadURL: () => Promise.resolve('https://example.com/mock-image.jpg')
    })
  };
}

// إنشاء Mock للإشعارات
function createMessagingMock() {
  return {
    requestPermission: () => Promise.resolve(true),
    getToken: () => Promise.resolve('mock-fcm-token'),
    onMessage: () => () => {},
    setBackgroundMessageHandler: () => {},
    subscribeToTopic: () => Promise.resolve(),
    unsubscribeFromTopic: () => Promise.resolve()
  };
}

// دالة للتحقق من حالة Firebase
export const isFirebaseAvailable = () => {
  return isFirebaseEnabled;
};

// دالة للحصول على معلومات الحالة
export const getFirebaseStatus = () => {
  return {
    enabled: isFirebaseEnabled,
    auth: !!firebaseAuth,
    firestore: !!firebaseFirestore,
    storage: !!firebaseStorage,
    messaging: !!firebaseMessaging
  };
};

// دالة للحصول على رسالة الخطأ
export const getFirebaseErrorMessage = (error) => {
  if (!isFirebaseEnabled) {
    return 'Firebase غير متاح. يتم تشغيل التطبيق في الوضع التجريبي.';
  }
  
  const errorCode = error.code || error.message;
  
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'لا يوجد مستخدم مسجل بهذا البريد الإلكتروني';
    case 'auth/wrong-password':
      return 'كلمة المرور غير صحيحة';
    case 'auth/invalid-email':
      return 'البريد الإلكتروني غير صالح';
    case 'auth/user-disabled':
      return 'تم تعطيل هذا الحساب';
    case 'auth/email-already-in-use':
      return 'هذا البريد الإلكتروني مستخدم بالفعل';
    case 'auth/weak-password':
      return 'كلمة المرور ضعيفة جداً (6 أحرف على الأقل)';
    case 'auth/network-request-failed':
      return 'فشل في الاتصال بالإنترنت';
    case 'auth/too-many-requests':
      return 'تم تجاوز عدد المحاولات المسموح. حاول مرة أخرى لاحقاً';
    default:
      return error.message || 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى';
  }
};

// تسجيل حالة Firebase
console.log('Firebase Status:', getFirebaseStatus());

// تصدير الخدمات
export { 
  firebaseAuth as auth, 
  firebaseFirestore as firestore,
  firebaseStorage as storage,
  firebaseMessaging as messaging 
};

export default app;