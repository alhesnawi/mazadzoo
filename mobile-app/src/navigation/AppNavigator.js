import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AnimalDetailScreen from '../screens/AnimalDetailScreen';
import BidsScreen from '../screens/BidsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import SplashScreen from '../screens/SplashScreen';
import AuctionsScreen from '../screens/AuctionsScreen';
import BiddingScreen from '../screens/BiddingScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import PaymentHistoryScreen from '../screens/PaymentHistoryScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import SupportScreen from '../screens/SupportScreen';
import HelpScreen from '../screens/HelpScreen';
import AboutScreen from '../screens/AboutScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import TermsScreen from '../screens/TermsScreen';
import MyListingsScreen from '../screens/MyListingsScreen';
import WalletScreen from '../screens/WalletScreen';

// Import context
import { useAuth } from '../contexts/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack Navigator
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1a472a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ title: 'تسجيل الدخول / Login' }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ title: 'إنشاء حساب / Register' }}
      />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Bids') {
            iconName = focused ? 'hammer' : 'hammer-outline';
          } else if (route.name === 'Wallet') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4a7c59',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
        },
        headerStyle: {
          backgroundColor: '#1a472a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'الرئيسية / Home' }}
      />
      <Tab.Screen 
        name="Bids" 
        component={BidsScreen} 
        options={{ title: 'مزايداتي / My Bids' }}
      />
      <Tab.Screen 
        name="Wallet" 
        component={WalletScreen} 
        options={{ title: 'المحفظة / Wallet' }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen} 
        options={{ title: 'المفضلة / Favorites' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'الملف الشخصي / Profile' }}
      />
    </Tab.Navigator>
  );
}

// Main Stack Navigator (يحتوي على كل الشاشات)
function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AnimalDetail" 
        component={AnimalDetailScreen} 
        options={{ title: 'تفاصيل الحيوان' }}
      />
      <Stack.Screen 
        name="Auctions" 
        component={AuctionsScreen} 
        options={{ title: 'المزادات' }}
      />
      <Stack.Screen 
        name="Bidding" 
        component={BiddingScreen} 
        options={{ title: 'المزايدة' }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{ title: 'الإشعارات' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'الإعدادات' }}
      />
      <Stack.Screen 
        name="PaymentMethods" 
        component={PaymentMethodsScreen} 
        options={{ title: 'طرق الدفع' }}
      />
      <Stack.Screen 
        name="PaymentHistory" 
        component={PaymentHistoryScreen} 
        options={{ title: 'سجل المدفوعات' }}
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen} 
        options={{ title: 'تغيير كلمة المرور' }}
      />
      <Stack.Screen 
        name="Support" 
        component={SupportScreen} 
        options={{ title: 'الدعم' }}
      />
      <Stack.Screen 
        name="Help" 
        component={HelpScreen} 
        options={{ title: 'المساعدة' }}
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen} 
        options={{ title: 'حول التطبيق' }}
      />
      <Stack.Screen 
        name="Privacy" 
        component={PrivacyScreen} 
        options={{ title: 'سياسة الخصوصية' }}
      />
      <Stack.Screen 
        name="Terms" 
        component={TermsScreen} 
        options={{ title: 'الشروط والأحكام' }}
      />
      <Stack.Screen 
        name="MyListings" 
        component={MyListingsScreen} 
        options={{ title: 'إعلاناتي' }}
      />
    </Stack.Navigator>
  );
}

// Main App Navigator
function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  // عرض شاشة التحميل أثناء فحص حالة المصادقة
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // المستخدم مسجل دخول - عرض الشاشات الرئيسية
          <Stack.Screen name="App" component={MainStack} />
        ) : (
          // المستخدم غير مسجل دخول - عرض شاشات المصادقة
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;