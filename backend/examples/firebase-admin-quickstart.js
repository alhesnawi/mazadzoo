/**
 * Firebase Admin SDK Quick Start Example
 * 
 * This example demonstrates the simplest way to initialize Firebase Admin SDK
 * using the service account credentials file.
 */

// Method 1: Direct initialization with service account file path
// This is similar to the code snippet provided by the user
const admin = require('firebase-admin');
const path = require('path');

// Path to the service account file
const serviceAccountPath = path.join(__dirname, '../config/firebase/mazadzoo-firebase-adminsdk-fbsvc-4b63d2e1a0.json');

// Initialize Firebase Admin SDK
const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath)
});

console.log('Firebase Admin SDK initialized successfully!');

// Basic usage examples
async function quickDemo() {
  try {
    // Get Auth service
    const auth = admin.auth(app);
    console.log('Auth service initialized');
    
    // Get Firestore service
    const firestore = admin.firestore(app);
    console.log('Firestore service initialized');
    
    // Get Messaging service
    const messaging = admin.messaging(app);
    console.log('Messaging service initialized');
    
    // Example: Check if Firestore is enabled
    console.log('\nAttempting to access Firestore:');
    try {
      const testCollection = firestore.collection('test');
      await testCollection.doc('example').set({
        message: 'Firebase Admin SDK is working!',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('Test document created successfully!');
      
      // Read the document back
      const docSnapshot = await testCollection.doc('example').get();
      if (docSnapshot.exists) {
        console.log('Retrieved test document:', docSnapshot.data());
      }
    } catch (firestoreError) {
      console.log('Firestore operation failed. This is normal if the Firestore API is not enabled.');
      console.log('To enable Firestore, visit: https://console.firebase.google.com/project/mazadzoo/firestore');
    }
    
    // Example: Create a custom token (this should work even if Firestore is not enabled)
    console.log('\nCreating a custom authentication token:');
    try {
      const uid = 'test-user-' + Math.floor(Math.random() * 1000000);
      const customToken = await auth.createCustomToken(uid);
      console.log(`Custom token created for user ${uid}:`, customToken);
    } catch (authError) {
      console.error('Error creating custom token:', authError);
    }
    
  } catch (error) {
    console.error('Error in quick demo:', error);
  }
}

// Run the demo
quickDemo().then(() => {
  console.log('\nQuick demo completed!');
  console.log('For more comprehensive examples, see firebase-usage-example.js');
  console.log('For production use, refer to the configured setup in ../config/firebase/admin.js');
});