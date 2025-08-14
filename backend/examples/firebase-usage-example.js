/**
 * Firebase Usage Examples
 * This file demonstrates how to use the Firebase Admin SDK in the application
 */

const firebaseService = require('../services/firebaseService');
const User = require('../models/User');

/**
 * Example: Verify a user's Firebase ID token and find or create the user in our database
 */
async function authenticateWithFirebase(idToken) {
  try {
    // Verify the ID token using Firebase Admin SDK
    const decodedToken = await firebaseService.auth.verifyIdToken(idToken);
    
    // Extract user information from the decoded token
    const { uid, email, name } = decodedToken;
    
    // Check if the user exists in our database
    let user = await User.findOne({ firebaseUid: uid });
    
    // If the user doesn't exist, create a new user
    if (!user) {
      // Get additional user information from Firebase
      const firebaseUser = await firebaseService.auth.getUserByUid(uid);
      
      // Create a new user in our database
      user = new User({
        firebaseUid: uid,
        email: email || firebaseUser.email,
        name: name || firebaseUser.displayName,
        profilePicture: firebaseUser.photoURL,
        isVerified: firebaseUser.emailVerified
      });
      
      await user.save();
    }
    
    return user;
  } catch (error) {
    console.error('Error authenticating with Firebase:', error);
    throw error;
  }
}

/**
 * Example: Store auction data in Firestore for analytics
 */
async function storeAuctionAnalytics(auctionId, auctionData) {
  try {
    // Add the auction data to Firestore
    const docId = await firebaseService.firestore.addDocument('auctions', {
      auctionId,
      ...auctionData,
      timestamp: new Date()
    });
    
    console.log(`Auction analytics stored in Firestore with ID: ${docId}`);
    return docId;
  } catch (error) {
    console.error('Error storing auction analytics:', error);
    // Non-critical error, so we don't throw
    return null;
  }
}

/**
 * Example: Send a push notification when a user is outbid
 */
async function sendOutbidNotification(user, animalName, newBidAmount) {
  try {
    // Check if the user has FCM tokens
    if (!user.fcmTokens || user.fcmTokens.length === 0) {
      console.log('User has no FCM tokens for push notifications');
      return false;
    }
    
    // Prepare the notification payload
    const notification = {
      title: 'You have been outbid!',
      body: `Someone placed a higher bid of ${newBidAmount} LYD on ${animalName}`,
      icon: '/assets/logo.png'
    };
    
    // Send the notification to all user devices
    const response = await firebaseService.messaging.sendToDevices(user.fcmTokens, notification);
    
    console.log(`Notification sent to ${response.successCount} devices`);
    return response.successCount > 0;
  } catch (error) {
    console.error('Error sending outbid notification:', error);
    // Non-critical error, so we don't throw
    return false;
  }
}

module.exports = {
  authenticateWithFirebase,
  storeAuctionAnalytics,
  sendOutbidNotification
};