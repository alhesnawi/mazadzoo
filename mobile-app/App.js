import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { AuctionProvider } from './src/contexts/AuctionContext';
import AppNavigator from './src/navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// Initialize Firebase
import './src/config/firebase';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AuctionProvider>
          <AppNavigator />
        </AuctionProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

