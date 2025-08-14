/**
 * Firebase Admin SDK Setup Test
 * This script tests if the Firebase Admin SDK is properly initialized
 */

const { getFirebaseAdmin, getAuth, getFirestore, getMessaging } = require('./config/firebase/admin');

console.log('Testing Firebase Admin SDK initialization...');

try {
  // Test Firebase App initialization
  const app = getFirebaseAdmin();
  console.log('✅ Firebase App initialized successfully!');
  
  // Test Firebase Auth
  const auth = getAuth();
  console.log('✅ Firebase Auth initialized successfully!');
  
  // Test Firestore
  const db = getFirestore();
  console.log('✅ Firebase Firestore initialized successfully!');
  
  // Test Messaging
  const messaging = getMessaging();
  console.log('✅ Firebase Messaging initialized successfully!');
  
  console.log('\n🎉 All Firebase services initialized successfully!');
  console.log('The Firebase Admin SDK is properly configured and ready to use.');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:', error);
  console.error('\nPlease check your credentials and configuration.');
}