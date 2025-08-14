# Firebase Integration Guide

## Overview

This guide explains how Firebase is integrated into the Rare Animals Auction Platform, covering both the backend (Node.js) and mobile app (React Native) implementations.

## Backend Integration

### Firebase Admin SDK Setup

The Firebase Admin SDK has been successfully integrated into the backend. The SDK allows server-side operations such as:

- Verifying Firebase ID tokens for authentication
- Accessing Firestore database
- Sending push notifications via Firebase Cloud Messaging (FCM)

### Implementation Details

#### Basic Initialization

The simplest way to initialize Firebase Admin SDK is as follows (similar to the code snippet provided):

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

#### Our Enhanced Implementation

Our implementation in `backend/config/firebase/admin.js` provides additional features:

1. **Multiple credential sources**: Checks for credentials in environment variables first, then falls back to the service account file
2. **Lazy initialization**: Services are only initialized when needed
3. **Service accessor functions**: Provides clean access to Firebase services

```javascript
// Example usage of our implementation
const { getAuth, getFirestore, getMessaging } = require('./config/firebase/admin');

const auth = getAuth();
const firestore = getFirestore();
const messaging = getMessaging();
```

### Current Status

- ✅ **Firebase Admin SDK**: Successfully installed and configured
- ✅ **Authentication**: Working correctly (verified with custom token creation)
- ⚠️ **Firestore**: API needs to be enabled in Firebase Console
- ⚠️ **Cloud Messaging**: Not tested yet

### Quickstart Example

A quickstart example is available at `backend/examples/firebase-admin-quickstart.js`. This example demonstrates:

- Initializing the Firebase Admin SDK
- Accessing Firebase services
- Creating a custom authentication token
- Attempting to access Firestore (with error handling)

Run it to verify your Firebase setup:

```bash
cd backend
node examples/firebase-admin-quickstart.js
```

## Mobile App Integration

### iOS Setup

The Firebase configuration for iOS has been added to the project as `mobile-app/GoogleService-Info.plist`. This file contains the necessary configuration for the Firebase iOS SDK.

### Android Setup

The Firebase configuration for Android has been added to the project as `mobile-app/google-services.json`. This file contains the necessary configuration for the Firebase Android SDK.

### React Native Implementation

A comprehensive example of Firebase usage in React Native is available at `mobile-app/examples/firebase-usage-example.js`. This example demonstrates:

- Authentication (sign in, sign out, listening for auth state changes)
- Firestore operations (reading and writing data)
- Cloud Messaging (receiving push notifications)

## Enabling Firebase Services

If you encounter errors about services not being enabled, you need to enable them in the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/project/mazadzoo/)
2. Navigate to the specific service (Authentication, Firestore, etc.)
3. Follow the prompts to enable the service

## Security Considerations

- **Never commit Firebase credentials to version control**
- For production environments, use environment variables for the Admin SDK credentials
- Follow the principle of least privilege when setting up Firebase service account permissions
- Implement proper security rules for Firestore and Storage

## Additional Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [React Native Firebase](https://rnfirebase.io/)