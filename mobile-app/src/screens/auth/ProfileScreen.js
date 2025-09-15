import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography, spacing } from '../../constants/theme';
import LoadingSpinner from '../../components/LoadingSpinner';

// Validation schema
const schema = yup.object({
  name: yup
    .string()
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل / Name must be at least 2 characters')
    .required('الاسم مطلوب / Name is required'),
  email: yup
    .string()
    .email('البريد الإلكتروني غير صحيح / Invalid email')
    .required('البريد الإلكتروني مطلوب / Email is required'),
  phone: yup
    .string()
    .matches(/^[0-9+\-\s()]+$/, 'رقم الهاتف غير صحيح / Invalid phone number')
    .min(10, 'رقم الهاتف يجب أن يكون 10 أرقام على الأقل / Phone must be at least 10 digits')
    .required('رقم الهاتف مطلوب / Phone number is required'),
});

const ProfileScreen = () => {
  const { user, updateProfile, logout, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const onSubmit = async (data) => {
    setIsUpdating(true);
    const result = await updateProfile(data);
    setIsUpdating(false);
    
    if (result.success) {
      setIsEditing(false);
      Alert.alert(
        'تم التحديث بنجاح / Update Successful',
        'تم تحديث ملفك الشخصي بنجاح / Your profile has been updated successfully'
      );
    } else {
      Alert.alert(
        'خطأ في التحديث / Update Error',
        result.error || 'حدث خطأ غير متوقع / An unexpected error occurred'
      );
    }
  };

  const handleCancel = () => {
    reset({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'تسجيل الخروج / Logout',
      'هل أنت متأكد من تسجيل الخروج؟ / Are you sure you want to logout?',
      [
        {
          text: 'إلغاء / Cancel',
          style: 'cancel',
        },
        {
          text: 'تسجيل الخروج / Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>جاري التحميل... / Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: user?.avatar || 'https://via.placeholder.com/100x100/cccccc/666666?text=User',
            }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.avatarEditButton}>
            <Text style={styles.avatarEditText}>📷</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{user?.name || 'مستخدم / User'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>المعلومات الشخصية</Text>
          <Text style={styles.sectionTitleEn}>Personal Information</Text>
          {!isEditing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>تعديل / Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>الاسم الكامل / Full Name</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  !isEditing && styles.inputDisabled,
                  errors.name && styles.inputError,
                ]}
                placeholder="أدخل اسمك الكامل / Enter your full name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={isEditing}
                autoCapitalize="words"
              />
            )}
          />
          {errors.name && (
            <Text style={styles.errorText}>{errors.name.message}</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>البريد الإلكتروني / Email</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  !isEditing && styles.inputDisabled,
                  errors.email && styles.inputError,
                ]}
                placeholder="أدخل بريدك الإلكتروني / Enter your email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={isEditing}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email.message}</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>رقم الهاتف / Phone Number</Text>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  !isEditing && styles.inputDisabled,
                  errors.phone && styles.inputError,
                ]}
                placeholder="أدخل رقم هاتفك / Enter your phone number"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={isEditing}
                keyboardType="phone-pad"
              />
            )}
          />
          {errors.phone && (
            <Text style={styles.errorText}>{errors.phone.message}</Text>
          )}
        </View>

        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>إلغاء / Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                isUpdating && styles.saveButtonDisabled,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <LoadingSpinner size="small" color={colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>حفظ / Save</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>الإعدادات</Text>
        <Text style={styles.sectionTitleEn}>Settings</Text>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>تغيير كلمة المرور</Text>
          <Text style={styles.actionButtonTextEn}>Change Password</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>الإشعارات</Text>
          <Text style={styles.actionButtonTextEn}>Notifications</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>الخصوصية</Text>
          <Text style={styles.actionButtonTextEn}>Privacy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={[styles.actionButtonText, styles.logoutButtonText]}>
            تسجيل الخروج
          </Text>
          <Text style={[styles.actionButtonTextEn, styles.logoutButtonText]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  header: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.lightGray,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditText: {
    fontSize: typography.sizes.sm,
  },
  userName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  form: {
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  sectionTitleEn: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    flex: 1,
    marginLeft: spacing.sm,
  },
  editButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  editButtonText: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    backgroundColor: colors.white,
    textAlign: 'right',
  },
  inputDisabled: {
    backgroundColor: colors.lightGray,
    color: colors.textSecondary,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  saveButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  actionsSection: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
    textAlign: 'center',
  },
  actionButtonTextEn: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  logoutButton: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  logoutButtonText: {
    color: colors.white,
  },
});

export default ProfileScreen;