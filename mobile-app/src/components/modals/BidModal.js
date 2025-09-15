import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { colors, typography, spacing } from '../../constants/theme';
import LoadingSpinner from '../LoadingSpinner';

const BidModal = ({ visible, onClose, onSubmit, currentPrice, minBidIncrement = 100 }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const minBidAmount = currentPrice + minBidIncrement;
  
  // Validation schema
  const schema = yup.object({
    amount: yup
      .number()
      .min(minBidAmount, `الحد الأدنى للمزايدة ${minBidAmount} ريال / Minimum bid is ${minBidAmount} SAR`)
      .required('مبلغ المزايدة مطلوب / Bid amount is required'),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      amount: minBidAmount,
    },
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(price);
  };

  const handleQuickBid = (increment) => {
    const newAmount = currentPrice + increment;
    setValue('amount', newAmount);
  };

  const onSubmitBid = async (data) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data.amount);
      reset();
    } catch (error) {
      Alert.alert(
        'خطأ / Error',
        'فشل في تقديم المزايدة / Failed to submit bid'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        >
          <View style={styles.modal} onStartShouldSetResponder={() => true}>
            <View style={styles.header}>
              <Text style={styles.title}>تقديم مزايدة</Text>
              <Text style={styles.titleEn}>Place Bid</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <View style={styles.priceInfo}>
                <Text style={styles.currentPriceLabel}>
                  السعر الحالي / Current Price
                </Text>
                <Text style={styles.currentPrice}>
                  {formatPrice(currentPrice)}
                </Text>
                
                <Text style={styles.minBidLabel}>
                  الحد الأدنى للمزايدة / Minimum Bid
                </Text>
                <Text style={styles.minBid}>
                  {formatPrice(minBidAmount)}
                </Text>
              </View>

              <View style={styles.quickBidsContainer}>
                <Text style={styles.quickBidsLabel}>
                  مزايدة سريعة / Quick Bid
                </Text>
                <View style={styles.quickBidsRow}>
                  {[100, 500, 1000, 2000].map((increment) => (
                    <TouchableOpacity
                      key={increment}
                      style={styles.quickBidButton}
                      onPress={() => handleQuickBid(increment)}
                    >
                      <Text style={styles.quickBidText}>+{increment}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  مبلغ المزايدة (ريال سعودي) / Bid Amount (SAR)
                </Text>
                <Controller
                  control={control}
                  name="amount"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        errors.amount && styles.inputError,
                      ]}
                      placeholder="أدخل مبلغ المزايدة / Enter bid amount"
                      value={value?.toString()}
                      onChangeText={(text) => {
                        const numericValue = parseFloat(text.replace(/[^0-9.]/g, ''));
                        onChange(isNaN(numericValue) ? '' : numericValue);
                      }}
                      onBlur={onBlur}
                      keyboardType="numeric"
                    />
                  )}
                />
                {errors.amount && (
                  <Text style={styles.errorText}>{errors.amount.message}</Text>
                )}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}
                >
                  <Text style={styles.cancelButtonText}>إلغاء / Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    isSubmitting && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit(onSubmitBid)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="small" color={colors.white} />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>تأكيد المزايدة</Text>
                      <Text style={styles.submitButtonTextEn}>Confirm Bid</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  titleEn: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  closeButton: {
    position: 'absolute',
    right: spacing.lg,
    top: spacing.lg,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
  },
  content: {
    padding: spacing.lg,
  },
  priceInfo: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  currentPriceLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  currentPrice: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  minBidLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  minBid: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.success,
  },
  quickBidsContainer: {
    marginBottom: spacing.lg,
  },
  quickBidsLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  quickBidsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickBidButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.sm,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
  },
  quickBidText: {
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
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.sizes.lg,
    backgroundColor: colors.white,
    textAlign: 'center',
    fontWeight: typography.weights.semibold,
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
  submitButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  submitButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  submitButtonTextEn: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
});

export default BidModal;