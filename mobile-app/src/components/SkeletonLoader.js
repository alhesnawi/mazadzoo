import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function SkeletonLoader({
  height = 20,
  width: customWidth = '100%',
  borderRadius = 4,
  style,
  animated = true,
}) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [animated, animatedValue]);

  const backgroundColor = animated
    ? animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#2d5a3d', '#4a7c59'],
      })
    : '#2d5a3d';

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          height,
          width: customWidth,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
}

// Predefined skeleton components
export function SkeletonCard({ style }) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        <SkeletonLoader width={40} height={40} borderRadius={20} />
        <View style={styles.cardHeaderText}>
          <SkeletonLoader width="70%" height={16} />
          <SkeletonLoader width="50%" height={14} style={{ marginTop: 4 }} />
        </View>
      </View>
      <SkeletonLoader width="100%" height={120} style={{ marginTop: 12 }} />
      <View style={styles.cardFooter}>
        <SkeletonLoader width="40%" height={14} />
        <SkeletonLoader width="30%" height={14} />
      </View>
    </View>
  );
}

export function SkeletonList({ count = 5, style }) {
  return (
    <View style={[styles.list, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} style={{ marginBottom: 16 }} />
      ))}
    </View>
  );
}

export function SkeletonAnimalCard({ style }) {
  return (
    <View style={[styles.animalCard, style]}>
      <SkeletonLoader width="100%" height={200} borderRadius={12} />
      <View style={styles.animalCardContent}>
        <View style={styles.animalCardHeader}>
          <SkeletonLoader width={32} height={32} borderRadius={16} />
          <View style={styles.animalCardText}>
            <SkeletonLoader width="80%" height={18} />
            <SkeletonLoader width="60%" height={14} style={{ marginTop: 4 }} />
          </View>
        </View>
        <View style={styles.animalCardDetails}>
          <SkeletonLoader width="50%" height={16} />
          <SkeletonLoader width="40%" height={14} style={{ marginTop: 8 }} />
          <SkeletonLoader width="60%" height={14} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.animalCardFooter}>
          <SkeletonLoader width="30%" height={12} />
          <SkeletonLoader width={80} height={32} borderRadius={16} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonProfile({ style }) {
  return (
    <View style={[styles.profile, style]}>
      <View style={styles.profileHeader}>
        <SkeletonLoader width={80} height={80} borderRadius={40} />
        <View style={styles.profileInfo}>
          <SkeletonLoader width="60%" height={20} />
          <SkeletonLoader width="40%" height={16} style={{ marginTop: 8 }} />
          <SkeletonLoader width="50%" height={14} style={{ marginTop: 4 }} />
        </View>
      </View>
      <View style={styles.profileStats}>
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} style={styles.profileStat}>
            <SkeletonLoader width={40} height={24} />
            <SkeletonLoader width={60} height={14} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#2d5a3d',
  },
  card: {
    backgroundColor: '#1a472a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2d5a3d',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  list: {
    padding: 16,
  },
  animalCard: {
    backgroundColor: '#1a472a',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2d5a3d',
  },
  animalCardContent: {
    padding: 16,
  },
  animalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  animalCardText: {
    flex: 1,
    marginLeft: 12,
  },
  animalCardDetails: {
    marginBottom: 16,
  },
  animalCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profile: {
    backgroundColor: '#1a472a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2d5a3d',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  profileStat: {
    alignItems: 'center',
  },
});