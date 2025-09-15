import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';
const { COLORS, SIZES, SHADOWS } = theme;
import { useAuth } from '../contexts/AuthContext'; // استخدم AuthContext بدلاً من ApiService

export default function LoginScreen({ navigation }) {
  const { login } = useAuth(); // استخدم login من AuthContext
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const result = await login({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        });

        if (result.success) {
          // AuthContext سيتولى التنقل تلقائياً
          // لا حاجة لاستخدام navigation.replace هنا
          console.log('تم تسجيل الدخول بنجاح');
        } else {
          Alert.alert('خطأ في تسجيل الدخول', result.error || 'فشل في تسجيل الدخول');
        }
      } else {
        // للتسجيل، انتقل إلى شاشة التسجيل
        navigation.navigate('Register');
      }
    } catch (error) {
      Alert.alert('خطأ', error.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={[COLORS.primary, '#16a34a']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="paw" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.logoText}>مزاد الحيوانات النادرة</Text>
            <Text style={styles.logoSubtext}>
              {isLogin ? 'مرحباً بعودتك' : 'انضم إلينا اليوم'}
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, isLogin && styles.activeTab]}
                onPress={() => setIsLogin(true)}
              >
                <Text style={[styles.tabText, isLogin && styles.activeTabText]}>
                  تسجيل الدخول
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, !isLogin && styles.activeTab]}
                onPress={() => setIsLogin(false)}
              >
                <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
                  إنشاء حساب
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.inputContainer}>
              {!isLogin && (
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="اسم المستخدم"
                    value={formData.username}
                    onChangeText={(value) => handleInputChange('username', value)}
                    textAlign="right"
                  />
                </View>
              )}

              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="البريد الإلكتروني"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  textAlign="right"
                />
              </View>

              {!isLogin && (
                <View style={styles.inputWrapper}>
                  <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="رقم الهاتف"
                    value={formData.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    keyboardType="phone-pad"
                    textAlign="right"
                  />
                </View>
              )}

              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="كلمة المرور"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                  textAlign="right"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'جاري التحميل...' : isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب'}
              </Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.footerLink}>
                  {isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* "Continue as Guest" option for login */}
            {isLogin && (
              <View style={styles.guestContainer}>
                <TouchableOpacity
                  style={styles.guestButton}
                  onPress={() => {
                    // Navigate to main app without authentication
                    Alert.alert(
                      'متابعة كضيف',
                      'ستتمكن من تصفح المزادات لكن لن تتمكن من المزايدة أو الإعجاب بالحيوانات',
                      [
                        { text: 'إلغاء', style: 'cancel' },
                        { text: 'متابعة', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'App' }] }) }
                      ]
                    );
                  }}
                >
                  <Text style={styles.guestButtonText}>متابعة كضيف</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SIZES.padding,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  logoText: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.background,
    textAlign: 'center',
    marginBottom: 8,
  },
  logoSubtext: {
    fontSize: SIZES.body1,
    color: COLORS.background,
    opacity: 0.9,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 24,
    ...SHADOWS.heavy,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.background,
    ...SHADOWS.light,
  },
  tabText: {
    fontSize: SIZES.body1,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    fontSize: SIZES.body1,
    color: COLORS.text,
    paddingVertical: 12,
    textAlign: 'right',
  },
  eyeIcon: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    ...SHADOWS.medium,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: SIZES.body1,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  footerLink: {
    fontSize: SIZES.body2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  guestContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  guestButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  guestButtonText: {
    fontSize: SIZES.body2,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
});