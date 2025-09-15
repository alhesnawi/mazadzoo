import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';
const { COLORS, SIZES, SHADOWS } = theme;
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

const ChangePasswordScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Current password validation
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'كلمة المرور الحالية مطلوبة';
    }

    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'كلمة المرور الجديدة مطلوبة';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
    }

    // Check if new password is same as current
    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success
      Alert.alert(
        'تم التحديث بنجاح',
        'تم تغيير كلمة المرور بنجاح',
        [
          {
            text: 'موافق',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء تغيير كلمة المرور. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: COLORS.gray };
    
    let strength = 0;
    let text = '';
    let color = COLORS.error;

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^\w\s]/.test(password)) strength++;

    switch (strength) {
      case 0:
      case 1:
        text = 'ضعيفة جداً';
        color = COLORS.error;
        break;
      case 2:
        text = 'ضعيفة';
        color = '#FF6B35';
        break;
      case 3:
        text = 'متوسطة';
        color = COLORS.warning;
        break;
      case 4:
        text = 'قوية';
        color = '#4CAF50';
        break;
      case 5:
        text = 'قوية جداً';
        color = COLORS.success;
        break;
    }

    return { strength, text, color };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  const renderPasswordInput = (field, placeholder, value, error) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{placeholder}</Text>
      <View style={[styles.passwordInputContainer, error && styles.inputError]}>
        <TextInput
          style={styles.passwordInput}
          placeholder={placeholder}
          value={value}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, [field]: text }));
            if (errors[field]) {
              setErrors(prev => ({ ...prev, [field]: null }));
            }
          }}
          secureTextEntry={!showPasswords[field === 'currentPassword' ? 'current' : field === 'newPassword' ? 'new' : 'confirm']}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => togglePasswordVisibility(field === 'currentPassword' ? 'current' : field === 'newPassword' ? 'new' : 'confirm')}
        >
          <Ionicons
            name={showPasswords[field === 'currentPassword' ? 'current' : field === 'newPassword' ? 'new' : 'confirm'] ? 'eye-off' : 'eye'}
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      {/* Password strength indicator for new password */}
      {field === 'newPassword' && formData.newPassword && (
        <View style={styles.strengthContainer}>
          <View style={styles.strengthBar}>
            {[1, 2, 3, 4, 5].map((level) => (
              <View
                key={level}
                style={[
                  styles.strengthSegment,
                  {
                    backgroundColor: level <= passwordStrength.strength
                      ? passwordStrength.color
                      : COLORS.border,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
            {passwordStrength.text}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تغيير كلمة المرور</Text>
        <Text style={styles.headerTitleEn}>Change Password</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Security Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
            <Text style={styles.infoTitle}>أمان كلمة المرور</Text>
          </View>
          <Text style={styles.infoText}>
            لضمان أمان حسابك، يرجى اختيار كلمة مرور قوية تحتوي على:
          </Text>
          <View style={styles.requirementsList}>
            <View style={styles.requirement}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.requirementText}>8 أحرف على الأقل</Text>
            </View>
            <View style={styles.requirement}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.requirementText}>حرف كبير وحرف صغير</Text>
            </View>
            <View style={styles.requirement}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.requirementText}>رقم واحد على الأقل</Text>
            </View>
            <View style={styles.requirement}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.textSecondary} />
              <Text style={styles.requirementText}>رمز خاص (اختياري)</Text>
            </View>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {renderPasswordInput(
            'currentPassword',
            'كلمة المرور الحالية',
            formData.currentPassword,
            errors.currentPassword
          )}
          
          {renderPasswordInput(
            'newPassword',
            'كلمة المرور الجديدة',
            formData.newPassword,
            errors.newPassword
          )}
          
          {renderPasswordInput(
            'confirmPassword',
            'تأكيد كلمة المرور الجديدة',
            formData.confirmPassword,
            errors.confirmPassword
          )}
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="تغيير كلمة المرور"
            onPress={handleChangePassword}
            disabled={loading}
            style={styles.submitButton}
          />
        </View>

        {/* Additional Security Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>نصائح الأمان</Text>
          <View style={styles.tip}>
            <Ionicons name="bulb-outline" size={16} color={COLORS.warning} />
            <Text style={styles.tipText}>لا تشارك كلمة المرور مع أي شخص</Text>
          </View>
          <View style={styles.tip}>
            <Ionicons name="bulb-outline" size={16} color={COLORS.warning} />
            <Text style={styles.tipText}>استخدم كلمة مرور مختلفة لكل حساب</Text>
          </View>
          <View style={styles.tip}>
            <Ionicons name="bulb-outline" size={16} color={COLORS.warning} />
            <Text style={styles.tipText}>غير كلمة المرور بانتظام</Text>
          </View>
        </View>
      </ScrollView>

      {loading && <LoadingSpinner />}
    </KeyboardAvoidingView>
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
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    flex: 1,
  },
  headerTitleEn: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    position: 'absolute',
    bottom: 5,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...SHADOWS.light,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 8,
  },
  infoText: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  requirementsList: {
    gap: 8,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requirementText: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: SIZES.body2,
    color: COLORS.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: SIZES.body1,
  },
  eyeButton: {
    padding: 12,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: SIZES.body3,
    color: COLORS.error,
    marginTop: 4,
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: SIZES.body3,
    fontWeight: '500',
  },
  buttonContainer: {
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  tipsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...SHADOWS.light,
  },
  tipsTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
});

export default ChangePasswordScreen;