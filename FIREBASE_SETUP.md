# Firebase Admin SDK Setup Guide

## Overview

This guide explains how to set up the Firebase Admin SDK for the Rare Animals Auction Platform. The Firebase Admin SDK enables server-side operations such as authentication verification, Firestore database access, and sending push notifications.

## Prerequisites

- A Firebase project created in the [Firebase Console](https://console.firebase.google.com/)
- Admin SDK credentials (service account key) downloaded from the Firebase Console

## Setup Instructions

### Step 1: Install Dependencies

The Firebase Admin SDK package has already been installed in the backend. You can verify this by checking the `package.json` file.

### Step 2: Add Firebase Admin SDK Credentials

You have two options for adding your Firebase Admin SDK credentials:

#### Option 1: Using Environment Variables (Recommended for Production)

1. Open the `.env` file in the `backend` directory
2. Add the following line, replacing the JSON with your actual service account credentials:

```
FIREBASE_ADMIN_SDK={"type":"service_account","project_id":"mazadzoo","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

**Important:** Make sure the JSON is properly formatted as a single line with all quotes escaped.

#### Option 2: Using a Service Account Key File (Recommended for Development)

1. Rename your service account key file to `mazadzoo-firebase-adminsdk-fbsvc-4b63d2e1a0.json`
2. Place the file in the `backend/config/firebase/` directory
3. Make sure the file is listed in `.gitignore` to prevent it from being committed to version control

### Step 3: Verify Setup

To verify that the Firebase Admin SDK is properly set up:

1. Start the backend server
2. Check the console logs for any Firebase-related errors
3. If there are no errors, the Firebase Admin SDK is properly initialized

## Usage

The Firebase Admin SDK is initialized in `backend/config/firebase/admin.js` and exposed through the `backend/services/firebaseService.js` module. You can use it in your application as shown in the example file at `backend/examples/firebase-usage-example.js`.

## Security Considerations

- **Never commit your Firebase Admin SDK credentials to version control**
- For production environments, always use environment variables
- Restrict access to the service account key file
- Follow the principle of least privilege when setting up Firebase service account permissions

## Troubleshooting

If you encounter issues with the Firebase Admin SDK:

1. Check that the credentials are properly formatted
2. Verify that the service account has the necessary permissions
3. Check the server logs for detailed error messages
4. Ensure the Firebase project is properly set up and enabled

## Additional Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)