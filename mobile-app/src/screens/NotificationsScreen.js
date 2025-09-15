import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';
const { COLORS, FONTS, SIZES, SHADOWS } = theme;
import { AuthContext } from '../contexts/AuthContext';
import { formatTimeAgo } from '../utils/helpers';
import ApiService from '../services/api';
import Loading from '../components/Loading';
import Button from '../components/Button';

const NotificationsScreen = ({ navigation }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState({
    bidUpdates: true,
    auctionEnding: true,
    newAnimals: true,
    priceDrops: true,
    outbid: true,
    auctionWon: true,
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchNotificationSettings();
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const data = await ApiService.getNotifications();
      setNotifications(data.notifications || []);
    } catch (error) {
      // Handle notifications fetch error
      Alert.alert('خطأ', 'فشل في تحميل الإشعارات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const data = await ApiService.getNotificationSettings();
      setSettings(data.settings || settings);
    } catch (error) {
      // Handle notification settings fetch error
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
  };

  const markAsRead = async (notificationId) => {
    try {
      await ApiService.markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      // Handle mark as read error
    }
  };

  const markAllAsRead = async () => {
    try {
      await ApiService.markAllNotificationsAsRead();
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تحديث الإشعارات');
    }
  };

  const deleteNotification = async (notificationId) => {
    Alert.alert(
      'حذف الإشعار',
      'هل تريد حذف هذا الإشعار؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.deleteNotification(notificationId);
              setNotifications(prev =>
                prev.filter(notification => notification._id !== notificationId)
              );
            } catch (error) {
              Alert.alert('خطأ', 'فشل في حذف الإشعار');
            }
          },
        },
      ]
    );
  };

  const updateNotificationSetting = async (key, value) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await ApiService.updateNotificationSettings(newSettings);
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تحديث الإعدادات');
      // Revert the change
      setSettings(prev => ({ ...prev, [key]: !value }));
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'bid_placed':
        return 'hammer';
      case 'outbid':
        return 'trending-up';
      case 'auction_ending':
        return 'time';
      case 'auction_won':
        return 'trophy';
      case 'auction_lost':
        return 'close-circle';
      case 'new_animal':
        return 'paw';
      case 'price_drop':
        return 'trending-down';
      case 'payment':
        return 'card';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'bid_placed':
        return COLORS.primary;
      case 'outbid':
        return COLORS.warning;
      case 'auction_ending':
        return COLORS.error;
      case 'auction_won':
        return COLORS.success;
      case 'auction_lost':
        return COLORS.gray;
      case 'new_animal':
        return COLORS.info;
      case 'price_drop':
        return COLORS.success;
      case 'payment':
        return COLORS.primary;
      default:
        return COLORS.gray;
    }
  };

  const handleNotificationPress = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'bid_placed':
      case 'outbid':
      case 'auction_ending':
      case 'auction_won':
      case 'auction_lost':
        if (notification.animalId) {
          navigation.navigate('AnimalDetail', { animalId: notification.animalId });
        }
        break;
      case 'new_animal':
        navigation.navigate('Auctions');
        break;
      case 'payment':
        navigation.navigate('Profile');
        break;
      default:
        break;
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.read && styles.unreadNotification,
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationContent}>
        <View style={[
          styles.notificationIcon,
          { backgroundColor: getNotificationColor(item.type) + '20' }
        ]}>
          <Ionicons
            name={getNotificationIcon(item.type)}
            size={24}
            color={getNotificationColor(item.type)}
          />
        </View>
        
        <View style={styles.notificationText}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>
            {formatTimeAgo(item.createdAt)}
          </Text>
        </View>

        {!item.read && <View style={styles.unreadDot} />}
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteNotification(item._id)}
      >
        <Ionicons name="close" size={20} color={COLORS.gray} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const SettingsSection = () => (
    <View style={styles.settingsSection}>
      <Text style={styles.settingsTitle}>إعدادات الإشعارات</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>تحديثات المزايدة</Text>
          <Text style={styles.settingDescription}>
            إشعارات عند وضع مزايدات جديدة
          </Text>
        </View>
        <Switch
          value={settings.bidUpdates}
          onValueChange={(value) => updateNotificationSetting('bidUpdates', value)}
          trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
          thumbColor={settings.bidUpdates ? COLORS.primary : COLORS.gray}
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>انتهاء المزادات</Text>
          <Text style={styles.settingDescription}>
            تنبيه قبل انتهاء المزادات المفضلة
          </Text>
        </View>
        <Switch
          value={settings.auctionEnding}
          onValueChange={(value) => updateNotificationSetting('auctionEnding', value)}
          trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
          thumbColor={settings.auctionEnding ? COLORS.primary : COLORS.gray}
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>حيوانات جديدة</Text>
          <Text style={styles.settingDescription}>
            إشعار عند إضافة حيوانات جديدة
          </Text>
        </View>
        <Switch
          value={settings.newAnimals}
          onValueChange={(value) => updateNotificationSetting('newAnimals', value)}
          trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
          thumbColor={settings.newAnimals ? COLORS.primary : COLORS.gray}
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>انخفاض الأسعار</Text>
          <Text style={styles.settingDescription}>
            تنبيه عند انخفاض أسعار الحيوانات المفضلة
          </Text>
        </View>
        <Switch
          value={settings.priceDrops}
          onValueChange={(value) => updateNotificationSetting('priceDrops', value)}
          trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
          thumbColor={settings.priceDrops ? COLORS.primary : COLORS.gray}
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>تجاوز المزايدة</Text>
          <Text style={styles.settingDescription}>
            إشعار عند تجاوز مزايدتك
          </Text>
        </View>
        <Switch
          value={settings.outbid}
          onValueChange={(value) => updateNotificationSetting('outbid', value)}
          trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
          thumbColor={settings.outbid ? COLORS.primary : COLORS.gray}
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>ربح المزاد</Text>
          <Text style={styles.settingDescription}>
            إشعار عند ربح المزادات
          </Text>
        </View>
        <Switch
          value={settings.auctionWon}
          onValueChange={(value) => updateNotificationSetting('auctionWon', value)}
          trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
          thumbColor={settings.auctionWon ? COLORS.primary : COLORS.gray}
        />
      </View>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-outline" size={80} color={COLORS.gray} />
      <Text style={styles.emptyTitle}>لا توجد إشعارات</Text>
      <Text style={styles.emptySubtitle}>
        ستظهر الإشعارات هنا عند توفرها
      </Text>
    </View>
  );

  const LoginPrompt = () => (
    <View style={styles.loginContainer}>
      <Ionicons name="person-outline" size={80} color={COLORS.gray} />
      <Text style={styles.loginTitle}>تسجيل الدخول مطلوب</Text>
      <Text style={styles.loginSubtitle}>
        يجب تسجيل الدخول لعرض الإشعارات
      </Text>
      <Button
        title="تسجيل الدخول"
        style={styles.loginButton}
        onPress={() => navigation.navigate('Login')}
      />
    </View>
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>الإشعارات</Text>
          <View style={styles.placeholder} />
        </View>
        <LoginPrompt />
      </View>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الإشعارات</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllText}>قراءة الكل</Text>
          </TouchableOpacity>
        )}
        {unreadCount === 0 && <View style={styles.placeholder} />}
      </View>

      {/* Unread Count */}
      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadText}>
            لديك {unreadCount} إشعار غير مقروء
          </Text>
        </View>
      )}

      <FlatList
        data={[{ type: 'settings' }, ...notifications]}
        renderItem={({ item, index }) => {
          if (item.type === 'settings') {
            return <SettingsSection />;
          }
          return renderNotification({ item });
        }}
        keyExtractor={(item, index) => item._id || `settings-${index}`}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={notifications.length === 0 ? <EmptyState /> : null}
      />

      {loading && <Loading visible text="جاري تحميل الإشعارات..." />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '20',
  },
  markAllText: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  placeholder: {
    width: 40,
  },
  unreadBanner: {
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  unreadText: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    textAlign: 'center',
  },
  listContainer: {
    flexGrow: 1,
  },
  settingsSection: {
    backgroundColor: COLORS.white,
    margin: SIZES.padding,
    borderRadius: 16,
    padding: 20,
    ...SHADOWS.light,
  },
  settingsTitle: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    lineHeight: 18,
  },
  notificationCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    ...SHADOWS.light,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
    marginTop: 4,
  },
  deleteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  emptyTitle: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  loginTitle: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginTop: 24,
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  loginButton: {
    paddingHorizontal: 32,
  },
});

export default NotificationsScreen;