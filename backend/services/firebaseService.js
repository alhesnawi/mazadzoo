/**
 * Firebase Service
 * Provides utility functions for Firebase operations
 */

const { getAuth, getFirestore, getMessaging } = require('../config/firebase/admin');
const logger = require('../utils/logger');

/**
 * Firebase Authentication Service
 */
const authService = {
  /**
   * Verify a Firebase ID token
   * @param {string} idToken - The Firebase ID token to verify
   * @returns {Promise<Object>} The decoded token
   */
  verifyIdToken: async (idToken) => {
    try {
      const auth = getAuth();
      if (!auth) throw new Error('Firebase Auth not initialized');
      
      return await auth.verifyIdToken(idToken);
    } catch (error) {
      logger.error('Error verifying Firebase ID token:', { error: error.message, stack: error.stack });
      throw error;
    }
  },
  
  /**
   * Get a user by UID
   * @param {string} uid - The user's UID
   * @returns {Promise<Object>} The user record
   */
  getUserByUid: async (uid) => {
    try {
      const auth = getAuth();
      if (!auth) throw new Error('Firebase Auth not initialized');
      
      return await auth.getUser(uid);
    } catch (error) {
      logger.error('Error getting user by UID:', { uid, error: error.message, stack: error.stack });
      throw error;
    }
  }
};

/**
 * Firebase Firestore Service
 */
const firestoreService = {
  /**
   * Get a document from Firestore
   * @param {string} collection - The collection name
   * @param {string} docId - The document ID
   * @returns {Promise<Object>} The document data
   */
  getDocument: async (collection, docId) => {
    try {
      const firestore = getFirestore();
      if (!firestore) throw new Error('Firebase Firestore not initialized');
      
      const doc = await firestore.collection(collection).doc(docId).get();
      return doc.exists ? doc.data() : null;
    } catch (error) {
      logger.error('Error getting Firestore document:', { collection, docId, error: error.message, stack: error.stack });
      throw error;
    }
  },
  
  /**
   * Add a document to Firestore
   * @param {string} collection - The collection name
   * @param {Object} data - The document data
   * @returns {Promise<string>} The document ID
   */
  addDocument: async (collection, data) => {
    try {
      const firestore = getFirestore();
      if (!firestore) throw new Error('Firebase Firestore not initialized');
      
      const docRef = await firestore.collection(collection).add(data);
      return docRef.id;
    } catch (error) {
      logger.error('Error adding Firestore document:', { collection, error: error.message, stack: error.stack });
      throw error;
    }
  }
};

/**
 * Firebase Cloud Messaging Service
 */
const messagingService = {
  /**
   * Send a notification to a specific device
   * @param {string} token - The FCM token of the device
   * @param {Object} notification - The notification payload
   * @returns {Promise<Object>} The messaging response
   */
  sendToDevice: async (token, notification) => {
    try {
      const messaging = getMessaging();
      if (!messaging) throw new Error('Firebase Messaging not initialized');
      
      return await messaging.send({
        token,
        notification
      });
    } catch (error) {
      logger.error('Error sending notification to device:', { token, error: error.message, stack: error.stack });
      throw error;
    }
  },
  
  /**
   * Send a notification to multiple devices
   * @param {Array<string>} tokens - The FCM tokens of the devices
   * @param {Object} notification - The notification payload
   * @returns {Promise<Object>} The messaging response
   */
  sendToDevices: async (tokens, notification) => {
    try {
      const messaging = getMessaging();
      if (!messaging) throw new Error('Firebase Messaging not initialized');
      
      return await messaging.sendMulticast({
        tokens,
        notification
      });
    } catch (error) {
      logger.error('Error sending notification to devices:', { tokensCount: tokens.length, error: error.message, stack: error.stack });
      throw error;
    }
  }
};

module.exports = {
  auth: authService,
  firestore: firestoreService,
  messaging: messagingService
};