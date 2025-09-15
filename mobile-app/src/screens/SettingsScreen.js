import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';
import theme from '../constants/theme';
const { COLORS, FONTS, SIZES, SHADOWS } = theme;
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/api';
import Loading from '../components/Loading';
import Button from '../components/Button';

const SettingsScreen = ({ navigation }) => {
  const { user, isAuthenticated, logout } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    biometric: false,
    darkMode: false,
    language: 'ar',
    currency: 'LYD',
    autoRefresh: true,
    soundEffects: true,
    vibration: true,
  });
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
      checkBiometricAvailability();
    }
  }, [isAuthenticated]);

  const loadSettings = async () => {
    try {
      const data = await ApiService.getUserSettings();
      setSettings(prev => ({ ...prev, ...data.settings }));
    } catch (error) {
      // Handle settings loading error
    }
  };

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(hasHardware && isEnrolled);
    } catch (error) {
      // Handle biometric check error
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await ApiService.updateUserSettings(newSettings);
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تحديث الإعدادات');
      // Revert the change
      setSettings(prev => ({ ...prev, [key]: !value }));
    }
  };

  const handleBiometricToggle = async (value) => {
    if (value) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'تأكيد الهوية',
          fallbackLabel: 'استخدام كلمة المرور',
        });
        
        if (result.success) {
          updateSetting('biometric', true);
        }
      } catch (error) {
        Alert.alert('خطأ', 'فشل في تفعيل المصادقة البيومترية');
      }
    } else {
      updateSetting('biometric', false);
    }
  };

  const handleNotificationToggle = async (value) => {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        updateSetting('notifications', true);
      } else {
        Alert.alert(
          'إذن الإشعارات',
          'يجب السماح بالإشعارات من إعدادات الجهاز',
          [
            { text: 'إلغاء', style: 'cancel' },
            { text: 'فتح الإعدادات', onPress: () => Linking.openSettings() },
          ]
        );
      }
    } else {
      updateSetting('notifications', false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل تريد تسجيل الخروج من حسابك؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تسجيل الخروج',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              Alert.alert('خطأ', 'فشل في تسجيل الخروج');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'حذف الحساب',
      'هل تريد حذف حسابك نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'تأكيد الحذف',
              'اكتب "حذف" لتأكيد حذف الحساب',
              [
                { text: 'إلغاء', style: 'cancel' },
                {
                  text: 'تأكيد',
                  style: 'destructive',
                  onPress: async () => {
                    setLoading(true);
                    try {
                      await ApiService.deleteAccount();
                      await logout();
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Auth' }],
                      });
                    } catch (error) {
                      Alert.alert('خطأ', 'فشل في حذف الحساب');
                    } finally {
                      setLoading(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'تطبيق مزاد الحيوانات النادرة - اكتشف وزايد على أندر الحيوانات',
        url: 'https://rareanimalsauction.com',
      });
    } catch (error) {
      // Handle app sharing error
    }
  };

  const handleRateApp = () => {
    // Open app store for rating
    const storeUrl = Platform.OS === 'ios' 
      ? 'https://apps.apple.com/app/id123456789'
      : 'https://play.google.com/store/apps/details?id=com.rareanimalsauction';
    
    Linking.openURL(storeUrl);
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onPress, 
    showSwitch = false, 
    onToggle,
    disabled = false,
    color = COLORS.black 
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, disabled && styles.disabledItem]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      
      <View style={styles.settingRight}>
        {showSwitch ? (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: COLORS.border, true: color + '40' }}
            thumbColor={value ? color : COLORS.gray}
            disabled={disabled}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
        )}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const LoginPrompt = () => (
    <View style={styles.loginContainer}>
      <Ionicons name="person-outline" size={80} color={COLORS.gray} />
      <Text style={styles.loginTitle}>تسجيل الدخول مطلوب</Text>
      <Text style={styles.loginSubtitle}>
        يجب تسجيل الدخول للوصول إلى الإعدادات
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
          <Text style={styles.headerTitle}>الإعدادات</Text>
          <View style={styles.placeholder} />
        </View>
        <LoginPrompt />
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>الإعدادات</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <SectionHeader title="الحساب" />
        <View style={styles.section}>
          <SettingItem
            icon="person-outline"
            title="الملف الشخصي"
            subtitle="تحديث معلومات الحساب"
            onPress={() => navigation.navigate('Profile')}
          />
          <SettingItem
            icon="card-outline"
            title="طرق الدفع"
            subtitle="إدارة بطاقات الدفع"
            onPress={() => navigation.navigate('PaymentMethods')}
          />
          <SettingItem
            icon="receipt-outline"
            title="سجل المدفوعات"
            subtitle="عرض تاريخ المعاملات"
            onPress={() => navigation.navigate('PaymentHistory')}
          />
        </View>

        {/* Security Section */}
        <SectionHeader title="الأمان" />
        <View style={styles.section}>
          <SettingItem
            icon="lock-closed-outline"
            title="تغيير كلمة المرور"
            subtitle="تحديث كلمة مرور الحساب"
            onPress={() => navigation.navigate('ChangePassword')}
          />
          <SettingItem
            icon="finger-print-outline"
            title="المصادقة البيومترية"
            subtitle="استخدام بصمة الإصبع أو الوجه"
            showSwitch={true}
            value={settings.biometric}
            onToggle={handleBiometricToggle}
            disabled={!biometricAvailable}
          />
        </View>

        {/* Notifications Section */}
        <SectionHeader title="الإشعارات" />
        <View style={styles.section}>
          <SettingItem
            icon="notifications-outline"
            title="الإشعارات"
            subtitle="تفعيل/إلغاء الإشعارات"
            showSwitch={true}
            value={settings.notifications}
            onToggle={handleNotificationToggle}
            color={COLORS.primary}
          />
          <SettingItem
            icon="settings-outline"
            title="إعدادات الإشعارات"
            subtitle="تخصيص أنواع الإشعارات"
            onPress={() => navigation.navigate('Notifications')}
          />
        </View>

        {/* App Preferences */}
        <SectionHeader title="تفضيلات التطبيق" />
        <View style={styles.section}>
          <SettingItem
            icon="refresh-outline"
            title="التحديث التلقائي"
            subtitle="تحديث البيانات تلقائياً"
            showSwitch={true}
            value={settings.autoRefresh}
            onToggle={(value) => updateSetting('autoRefresh', value)}
            color={COLORS.info}
          />
          <SettingItem
            icon="volume-high-outline"
            title="المؤثرات الصوتية"
            subtitle="تشغيل الأصوات في التطبيق"
            showSwitch={true}
            value={settings.soundEffects}
            onToggle={(value) => updateSetting('soundEffects', value)}
            color={COLORS.warning}
          />
          <SettingItem
            icon="phone-vibrate-outline"
            title="الاهتزاز"
            subtitle="تفعيل الاهتزاز للإشعارات"
            showSwitch={true}
            value={settings.vibration}
            onToggle={(value) => updateSetting('vibration', value)}
            color={COLORS.success}
          />
          <SettingItem
            icon="language-outline"
            title="اللغة"
            subtitle="العربية"
            onPress={() => {
              Alert.alert('قريباً', 'ستتوفر خيارات اللغة قريباً');
            }}
          />
        </View>

        {/* Support Section */}
        <SectionHeader title="الدعم والمساعدة" />
        <View style={styles.section}>
          <SettingItem
            icon="help-circle-outline"
            title="مركز المساعدة"
            subtitle="الأسئلة الشائعة والدعم"
            onPress={() => navigation.navigate('Help')}
          />
          <SettingItem
            icon="mail-outline"
            title="اتصل بنا"
            subtitle="support@rareanimalsauction.com"
            onPress={() => Linking.openURL('mailto:support@rareanimalsauction.com')}
          />
          <SettingItem
            icon="share-outline"
            title="مشاركة التطبيق"
            subtitle="شارك التطبيق مع الأصدقاء"
            onPress={handleShareApp}
          />
          <SettingItem
            icon="star-outline"
            title="تقييم التطبيق"
            subtitle="قيم التطبيق في المتجر"
            onPress={handleRateApp}
          />
        </View>

        {/* About Section */}
        <SectionHeader title="حول التطبيق" />
        <View style={styles.section}>
          <SettingItem
            icon="information-circle-outline"
            title="حول التطبيق"
            subtitle="الإصدار 1.0.0"
            onPress={() => navigation.navigate('About')}
          />
          <SettingItem
            icon="document-text-outline"
            title="شروط الاستخدام"
            subtitle="اقرأ شروط وأحكام الاستخدام"
            onPress={() => Linking.openURL('https://rareanimalsauction.com/terms')}
          />
          <SettingItem
            icon="shield-checkmark-outline"
            title="سياسة الخصوصية"
            subtitle="كيف نحمي بياناتك"
            onPress={() => Linking.openURL('https://rareanimalsauction.com/privacy')}
          />
        </View>

        {/* Danger Zone */}
        <SectionHeader title="منطقة الخطر" />
        <View style={styles.section}>
          <SettingItem
            icon="log-out-outline"
            title="تسجيل الخروج"
            subtitle="الخروج من الحساب الحالي"
            onPress={handleLogout}
            color={COLORS.warning}
          />
          <SettingItem
            icon="trash-outline"
            title="حذف الحساب"
            subtitle="حذف الحساب نهائياً"
            onPress={handleDeleteAccount}
            color={COLORS.error}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            مزاد الحيوانات النادرة © 2024
          </Text>
          <Text style={styles.versionText}>الإصدار 1.0.0</Text>
        </View>
      </ScrollView>

      {loading && <Loading visible text="جاري المعالجة..." />}
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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginTop: 32,
    marginBottom: 12,
    marginHorizontal: SIZES.padding,
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    borderRadius: 16,
    ...SHADOWS.light,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  disabledItem: {
    opacity: 0.5,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    lineHeight: 18,
  },
  settingRight: {
    marginLeft: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: SIZES.padding,
  },
  footerText: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
    marginBottom: 4,
  },
  versionText: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
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

export default SettingsScreen;