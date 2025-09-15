import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Modal,
  Switch,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import theme from '../constants/theme';
const { COLORS, FONTS, SIZES, SHADOWS } = theme;
import { useAuth } from '../contexts/AuthContext';
import { AuctionContext } from '../contexts/AuctionContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Loading from '../components/Loading';
import {
  formatCurrency,
  formatDateTime,
  validateEmail,
  validatePhone,
  validatePassword,
} from '../utils/helpers';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateProfile } = useAuth();
  const { getUserBids, getFavoriteAnimals } = useContext(AuctionContext);

  const [stats, setStats] = useState({
    totalBids: 0,
    wonAuctions: 0,
    activeListings: 0,
    walletBalance: 0,
    favoriteAnimals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    smsNotifications: false,
    biometricAuth: false,
    darkMode: false,
    language: 'ar',
  });
  const [walletAmount, setWalletAmount] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserData();
      setEditForm({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const [userBids, favoriteAnimals] = await Promise.all([
        getUserBids(),
        getFavoriteAnimals(),
      ]);
      
      setStats({
        totalBids: userBids.length,
        wonAuctions: userBids.filter(bid => bid.isWinner).length,
        activeListings: 0, // This would come from user's listings
        walletBalance: user.walletBalance || 0,
        favoriteAnimals: favoriteAnimals.length,
      });
    } catch (error) {
      // Handle user data fetch error
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تسجيل الخروج',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const handleEditProfile = async () => {
    try {
      if (!validateEmail(editForm.email)) {
        Alert.alert('خطأ', 'البريد الإلكتروني غير صحيح');
        return;
      }

      if (editForm.phone && !validatePhone(editForm.phone)) {
        Alert.alert('خطأ', 'رقم الهاتف غير صحيح');
        return;
      }

      await updateProfile(editForm);
      setShowEditModal(false);
      Alert.alert('نجح', 'تم تحديث الملف الشخصي بنجاح');
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تحديث الملف الشخصي');
    }
  };

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('خطأ', 'نحتاج إذن للوصول إلى الصور');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        // Upload image logic here
        // Image selected successfully
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل في اختيار الصورة');
    }
  };

  const handleBiometricAuth = async (enabled) => {
    if (enabled) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert('خطأ', 'المصادقة البيومترية غير متاحة على هذا الجهاز');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'تأكيد تفعيل المصادقة البيومترية',
        fallbackLabel: 'استخدام كلمة المرور',
      });

      if (result.success) {
        setSettings(prev => ({ ...prev, biometricAuth: enabled }));
      }
    } else {
      setSettings(prev => ({ ...prev, biometricAuth: enabled }));
    }
  };

  const handleAddFunds = async () => {
    try {
      const amount = parseFloat(walletAmount);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('خطأ', 'يرجى إدخال مبلغ صحيح');
        return;
      }

      // Add funds logic here
      Alert.alert('نجح', `تم إضافة ${formatCurrency(amount)} إلى محفظتك`);
      setWalletAmount('');
      setShowWalletModal(false);
      await fetchUserData();
    } catch (error) {
      Alert.alert('خطأ', 'فشل في إضافة الرصيد');
    }
  };

  const MenuOption = ({ icon, title, subtitle, onPress, showArrow = true, rightComponent }) => (
    <TouchableOpacity style={styles.menuOption} onPress={onPress}>
      <View style={styles.menuIconContainer}>
        <Ionicons name={icon} size={24} color={COLORS.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent || (showArrow && (
        <Ionicons name="chevron-back" size={20} color={COLORS.gray} />
      ))}
    </TouchableOpacity>
  );

  const StatCard = ({ icon, value, label, color, onPress }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <Loading visible text="جاري التحميل..." />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleImagePicker}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={40} color={COLORS.white} />
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={16} color={COLORS.white} />
            </View>
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.username || 'المستخدم'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.verificationBadge}>
              <Ionicons 
                name={user?.isVerified ? "checkmark-circle" : "time-outline"} 
                size={16} 
                color={user?.isVerified ? COLORS.success : COLORS.warning} 
              />
              <Text style={[styles.verificationText, { 
                color: user?.isVerified ? COLORS.success : COLORS.warning 
              }]}>
                {user?.isVerified ? 'موثق' : 'في انتظار التوثيق'}
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.editButton} onPress={() => setShowEditModal(true)}>
          <Ionicons name="create-outline" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="hammer"
            value={stats.totalBids}
            label="مزايداتي"
            color={COLORS.primary}
            onPress={() => navigation.navigate('Bidding')}
          />
          <StatCard
            icon="trophy"
            value={stats.wonAuctions}
            label="فزت بها"
            color={COLORS.warning}
            onPress={() => navigation.navigate('Bidding')}
          />
          <StatCard
            icon="heart"
            value={stats.favoriteAnimals}
            label="المفضلة"
            color={COLORS.error}
            onPress={() => navigation.navigate('Favorites')}
          />
        </View>

        {/* Wallet Section */}
        <View style={styles.walletContainer}>
          <View style={styles.walletHeader}>
            <View style={styles.walletInfo}>
              <Text style={styles.walletLabel}>رصيد المحفظة</Text>
              <Text style={styles.walletBalance}>{formatCurrency(stats.walletBalance)}</Text>
            </View>
            <TouchableOpacity 
              style={styles.addFundsButton}
              onPress={() => setShowWalletModal(true)}
            >
              <Ionicons name="add" size={20} color={COLORS.white} />
              <Text style={styles.addFundsText}>إضافة رصيد</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          <MenuOption
            icon="hammer-outline"
            title="مزايداتي"
            subtitle="عرض جميع المزايدات"
            onPress={() => navigation.navigate('Bidding')}
          />
          <MenuOption
            icon="list-outline"
            title="إعلاناتي"
            subtitle="إدارة الحيوانات المعروضة"
            onPress={() => navigation.navigate('MyListings')}
          />
          <MenuOption
            icon="card-outline"
            title="سجل المدفوعات"
            subtitle="عرض تاريخ المعاملات"
            onPress={() => navigation.navigate('PaymentHistory')}
          />
          <MenuOption
            icon="heart-outline"
            title="المفضلة"
            subtitle="الحيوانات المحفوظة"
            onPress={() => navigation.navigate('Favorites')}
          />
          <MenuOption
            icon="notifications-outline"
            title="الإشعارات"
            subtitle="إدارة التنبيهات"
            onPress={() => navigation.navigate('Notifications')}
          />
          <MenuOption
            icon="settings-outline"
            title="الإعدادات"
            subtitle="إعدادات الحساب والخصوصية"
            onPress={() => setShowSettingsModal(true)}
          />
          <MenuOption
            icon="help-circle-outline"
            title="المساعدة والدعم"
            subtitle="الأسئلة الشائعة والتواصل"
            onPress={() => navigation.navigate('Support')}
          />
          <MenuOption
            icon="information-circle-outline"
            title="حول التطبيق"
            subtitle="معلومات التطبيق والشروط"
            onPress={() => navigation.navigate('About')}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تعديل الملف الشخصي</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Input
                label="اسم المستخدم"
                value={editForm.username}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, username: text }))}
                placeholder="أدخل اسم المستخدم"
              />
              <Input
                label="البريد الإلكتروني"
                value={editForm.email}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text }))}
                placeholder="أدخل البريد الإلكتروني"
                keyboardType="email-address"
              />
              <Input
                label="رقم الهاتف"
                value={editForm.phone}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, phone: text }))}
                placeholder="أدخل رقم الهاتف"
                keyboardType="phone-pad"
              />
              <Input
                label="نبذة شخصية"
                value={editForm.bio}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, bio: text }))}
                placeholder="أدخل نبذة عنك"
                multiline
                numberOfLines={3}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="إلغاء"
                style={[styles.modalButton, styles.cancelButton]}
                textStyle={styles.cancelButtonText}
                onPress={() => setShowEditModal(false)}
              />
              <Button
                title="حفظ"
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleEditProfile}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={showSettingsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>الإعدادات</Text>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>الإشعارات</Text>
                <Switch
                  value={settings.notifications}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, notifications: value }))}
                  trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                />
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>إشعارات البريد الإلكتروني</Text>
                <Switch
                  value={settings.emailNotifications}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, emailNotifications: value }))}
                  trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                />
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>إشعارات الرسائل النصية</Text>
                <Switch
                  value={settings.smsNotifications}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, smsNotifications: value }))}
                  trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                />
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>المصادقة البيومترية</Text>
                <Switch
                  value={settings.biometricAuth}
                  onValueChange={handleBiometricAuth}
                  trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                />
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>الوضع المظلم</Text>
                <Switch
                  value={settings.darkMode}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, darkMode: value }))}
                  trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="حفظ الإعدادات"
                style={styles.fullWidthButton}
                onPress={() => {
                  setShowSettingsModal(false);
                  Alert.alert('نجح', 'تم حفظ الإعدادات');
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Wallet Modal */}
      <Modal visible={showWalletModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>إضافة رصيد</Text>
              <TouchableOpacity onPress={() => setShowWalletModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.walletModalText}>
                الرصيد الحالي: {formatCurrency(stats.walletBalance)}
              </Text>
              
              <Input
                label="المبلغ المراد إضافته"
                value={walletAmount}
                onChangeText={setWalletAmount}
                placeholder="0.00"
                keyboardType="numeric"
                leftIcon="card-outline"
              />

              <View style={styles.quickAmounts}>
                <Text style={styles.quickAmountsLabel}>مبالغ سريعة:</Text>
                <View style={styles.quickAmountsRow}>
                  {[100, 500, 1000, 2000].map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      style={styles.quickAmountButton}
                      onPress={() => setWalletAmount(amount.toString())}
                    >
                      <Text style={styles.quickAmountText}>{amount}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Button
                title="إلغاء"
                style={[styles.modalButton, styles.cancelButton]}
                textStyle={styles.cancelButtonText}
                onPress={() => setShowWalletModal(false)}
              />
              <Button
                title="إضافة"
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddFunds}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingHorizontal: SIZES.padding,
    paddingBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationText: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.medium,
    marginLeft: 4,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    ...SHADOWS.light,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: 'center',
  },
  walletContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...SHADOWS.medium,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 4,
  },
  walletBalance: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  addFundsButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addFundsText: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.white,
    marginLeft: 4,
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.light,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    marginTop: 20,
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutText: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.semiBold,
    color: COLORS.error,
    marginLeft: 8,
  },
  bottomPadding: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  modalBody: {
    padding: SIZES.padding,
    maxHeight: 400,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  cancelButtonText: {
    color: COLORS.gray,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  fullWidthButton: {
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingLabel: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  walletModalText: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SIZES.padding,
  },
  quickAmounts: {
    marginTop: SIZES.padding,
  },
  quickAmountsLabel: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.black,
    marginBottom: SIZES.base,
  },
  quickAmountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
});

export default ProfileScreen;

