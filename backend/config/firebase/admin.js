/**
 * Firebase Admin SDK Configuration
 * This file initializes the Firebase Admin SDK for server-side operations
 */

const admin = require('firebase-admin');
const path = require('path');
const logger = require('../../utils/logger');
const fs = require('fs');
const { FIREBASE_ADMIN_SDK } = require('../environment');

// Initialize Firebase Admin SDK
let firebaseApp;

const initializeFirebaseAdmin = () => {
  try {
    // If already initialized, return the existing app
    if (firebaseApp) {
      return firebaseApp;
    }

    // Check if credentials are provided as environment variable
    if (FIREBASE_ADMIN_SDK) {
      try {
        // Parse the JSON string from environment variable
        const serviceAccount = JSON.parse(FIREBASE_ADMIN_SDK);
        
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        
        logger.info('Firebase Admin SDK initialized from environment variable');
        return firebaseApp;
      } catch (error) {
      logger.error('Error parsing Firebase Admin SDK credentials from environment variable:', {
        error: error.message,
        stack: error.stack
      });
      }
    }

    // Check if credentials file exists
    const serviceAccountPath = path.join(__dirname, 'mazadzoo-firebase-adminsdk-fbsvc-4b63d2e1a0.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath)
      });
      
      logger.info('Firebase Admin SDK initialized from credentials file');
      return firebaseApp;
    }

    logger.warn('Firebase Admin SDK credentials not found. Some features may not work properly.');
    return null;
  } catch (error) {
    logger.error('Error initializing Firebase Admin SDK:', {
      error: error.message,
      stack: error.stack
    });
    return null;
  }
};

module.exports = {
  getFirebaseAdmin: () => {
    if (!firebaseApp) {
      firebaseApp = initializeFirebaseAdmin();
    }
    return firebaseApp;
  },
  getAuth: () => {
    const app = initializeFirebaseAdmin();
    return app ? admin.auth(app) : null;
  },
  getFirestore: () => {
    const app = initializeFirebaseAdmin();
    return app ? admin.firestore(app) : null;
  },
  getMessaging: () => {
    const app = initializeFirebaseAdmin();
    return app ? admin.messaging(app) : null;
  }
};