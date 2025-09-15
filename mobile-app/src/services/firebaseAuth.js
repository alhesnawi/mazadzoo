import { auth } from '../config/firebase';

// Check if Firebase is initialized
export const isFirebaseInitialized = () => {
  return auth !== null;
};

// Register user with email and password
export const registerUser = async (email, password, userData) => {
  try {
    if (!auth) {
      throw new Error('Firebase not initialized');
    }
    
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Update user profile
    await user.updateProfile({
      displayName: userData.name,
    });
    
    // Note: User document creation in Firestore is disabled
    // You can store user data in your backend API instead
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        ...userData
      }
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Login user with email and password
export const loginUser = async (email, password) => {
  try {
    if (!auth) {
      throw new Error('Firebase not initialized');
    }
    
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Note: Firestore user data fetching is disabled
    // You can fetch user data from your backend API instead
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    if (!auth) {
      throw new Error('Firebase not initialized');
    }
    
    await auth().signOut();
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get current user
export const getCurrentUser = () => {
  if (!auth) {
    return null;
  }
  
  const currentUser = auth().currentUser;
  if (currentUser) {
    // Note: Firestore user data fetching is disabled
    // Return basic user info from Firebase Auth
    return {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName,
    };
  }
  return null;
};

// Update user profile
export const updateUserProfile = async (userData) => {
  try {
    if (!auth) {
      throw new Error('Firebase not initialized');
    }
    
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    // Update Firebase Auth profile
    await currentUser.updateProfile({
      displayName: userData.name,
    });
    
    // Note: Firestore document update is disabled
    // You can update user data in your backend API instead
    
    return {
      success: true,
      user: {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        ...userData
      }
    };
  } catch (error) {
    console.error('Profile update error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    if (!auth) {
      throw new Error('Firebase not initialized');
    }
    
    await auth().sendPasswordResetEmail(email);
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};