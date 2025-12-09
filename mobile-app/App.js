import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { AuctionProvider } from './src/contexts/AuctionContext';
import AppNavigator from './src/navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Initialize Firebase with error handling
let firebaseInitError = null;
try {
  require('./src/config/firebase');
} catch (error) {
  console.warn('Firebase initialization warning:', error.message);
  firebaseInitError = error;
}

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Give the app time to initialize
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AuctionProvider>
          <AppNavigator />
          <StatusBar barStyle="dark-content" />
        </AuctionProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

