import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Modal,
} from 'react-native';
import theme from '../constants/theme';
const { COLORS, FONTS, SIZES, SHADOWS } = theme;

const Loading = ({
  visible = false,
  text = 'جاري التحميل...',
  overlay = false,
  size = 'large',
  color = COLORS.primary,
  style,
  textStyle,
}) => {
  const LoadingContent = () => (
    <View style={[styles.container, overlay && styles.overlayContainer, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text style={[styles.text, textStyle]}>{text}</Text>
      )}
    </View>
  );

  if (overlay) {
    return (
      <Modal
        transparent
        visible={visible}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <LoadingContent />
          </View>
        </View>
      </Modal>
    );
  }

  return visible ? <LoadingContent /> : null;
};

// Simple loading spinner without text
export const LoadingSpinner = ({ size = 'small', color = COLORS.primary, style }) => (
  <View style={[styles.spinnerContainer, style]}>
    <ActivityIndicator size={size} color={color} />
  </View>
);

// Loading overlay for screens
export const LoadingOverlay = ({ visible, text }) => (
  <Loading visible={visible} text={text} overlay />
);

// Loading placeholder for lists
export const LoadingPlaceholder = ({ count = 3, height = 80, style }) => (
  <View style={style}>
    {Array.from({ length: count }).map((_, index) => (
      <View key={index} style={[styles.placeholder, { height }]}>
        <View style={styles.placeholderContent}>
          <View style={styles.placeholderImage} />
          <View style={styles.placeholderText}>
            <View style={styles.placeholderLine} />
            <View style={[styles.placeholderLine, styles.placeholderLineShort]} />
          </View>
        </View>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding,
  },
  overlayContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    margin: SIZES.padding,
    ...SHADOWS.medium,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 2,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
  },
  text: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.black,
    marginTop: SIZES.padding,
    textAlign: 'center',
  },
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.base,
  },
  placeholder: {
    backgroundColor: COLORS.lightGray2,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base,
    overflow: 'hidden',
  },
  placeholderContent: {
    flexDirection: 'row',
    padding: SIZES.padding,
    alignItems: 'center',
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.lightGray,
    marginRight: SIZES.padding,
  },
  placeholderText: {
    flex: 1,
  },
  placeholderLine: {
    height: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 6,
    marginBottom: SIZES.base,
  },
  placeholderLineShort: {
    width: '60%',
  },
});

export default Loading;