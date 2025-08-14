# Firebase Admin SDK Setup

## Overview
This directory contains the configuration for Firebase Admin SDK integration with the Rare Animals Auction Platform. The Firebase Admin SDK allows server-side operations such as authentication verification, Firestore database access, and sending push notifications.

## Setup Instructions

There are two ways to set up the Firebase Admin SDK:

### Option 1: Using Environment Variables (Recommended for Production)

1. Add the following to your `.env` file:

```
FIREBASE_ADMIN_SDK='{"type":"service_account","project_id":"mazadzoo","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'  
```

**Note:** The value should be a valid JSON string with all quotes properly escaped.

### Option 2: Using a Service Account Key File (Recommended for Development)

1. Place the `mazadzoo-firebase-adminsdk-fbsvc-4b63d2e1a0.json` file in this directory.
2. Make sure the file is not committed to version control by adding it to `.gitignore`.

## Security Considerations

- **Never commit your Firebase Admin SDK credentials to version control**
- For production environments, always use environment variables
- Restrict access to the service account key file
- Follow the principle of least privilege when setting up Firebase service account permissions

## Current Status

- ✅ **Firebase Admin SDK**: Successfully installed and configured
- ✅ **Authentication**: Working correctly (verified with custom token creation)
- ⚠️ **Firestore**: API needs to be enabled in Firebase Console
- ⚠️ **Cloud Messaging**: Not tested yet

## Usage

### Using the Firebase Service

The Firebase Admin SDK is initialized in `admin.js` and exposed through the `firebaseService.js` module. You can use it in your application as follows:

```javascript
const firebaseService = require('../services/firebaseService');

// Authentication
const decodedToken = await firebaseService.auth.verifyIdToken(idToken);

// Firestore
const document = await firebaseService.firestore.getDocument('collection', 'docId');

// Cloud Messaging
const response = await firebaseService.messaging.sendToDevice(fcmToken, notification);
```

### Direct Access to Firebase Services

You can also access Firebase services directly using the exported functions from `admin.js`:

```javascript
const { getAuth, getFirestore, getMessaging } = require('../config/firebase/admin');

// Get Firebase Auth service
const auth = getAuth();

// Get Firestore service
const firestore = getFirestore();

// Get Cloud Messaging service
const messaging = getMessaging();
```

### Quick Start Example

A quickstart example is available at `backend/examples/firebase-admin-quickstart.js`. Run it to verify your Firebase setup:

```bash
node examples/firebase-admin-quickstart.js
```

## Troubleshooting

If you encounter issues with the Firebase Admin SDK:

1. Check that the credentials are properly formatted
2. Verify that the service account has the necessary permissions
3. Check the server logs for detailed error messages
4. Ensure the Firebase project is properly set up and enabled