import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';
const { COLORS, FONTS, SIZES, SHADOWS } = theme;
import { formatCurrency, formatTimeRemaining, getStatusColor, getStatusText } from '../utils/helpers';

const { width } = Dimensions.get('window');
const cardWidth = (width - SIZES.padding * 3) / 2;

const AnimalCard = ({
  animal,
  onPress,
  onFavoritePress,
  isFavorite = false,
  showFavoriteButton = true,
  style,
}) => {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (animal.auctionEndTime) {
      const updateTimer = () => {
        setTimeRemaining(formatTimeRemaining(animal.auctionEndTime));
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    }
  }, [animal.auctionEndTime]);

  const handleFavoritePress = () => {
    if (onFavoritePress) {
      onFavoritePress(animal.id);
    }
  };

  const getImageSource = () => {
    if (animal.images && animal.images.length > 0) {
      return { uri: animal.images[0] };
    }
    return require('../assets/images/placeholder-animal.png');
  };

  const isAuctionActive = () => {
    if (!animal.auctionEndTime) return false;
    return new Date() < new Date(animal.auctionEndTime);
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress && onPress(animal)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={getImageSource()}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(animal.status) }]}>
          <Text style={styles.statusText}>{getStatusText(animal.status)}</Text>
        </View>

        {/* Favorite Button */}
        {showFavoriteButton && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? COLORS.error : COLORS.white}
            />
          </TouchableOpacity>
        )}

        {/* Time Remaining Overlay */}
        {isAuctionActive() && timeRemaining && (
          <View style={styles.timeOverlay}>
            <Ionicons name="time-outline" size={12} color={COLORS.white} />
            <Text style={styles.timeText}>{timeRemaining}</Text>
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.animalName} numberOfLines={1}>
          {animal.name}
        </Text>
        
        <Text style={styles.animalType} numberOfLines={1}>
          {animal.type} • {animal.breed}
        </Text>

        <View style={styles.priceContainer}>
          <Text style={styles.currentBidLabel}>المزايدة الحالية</Text>
          <Text style={styles.currentBidAmount}>
            {formatCurrency(animal.currentBid || animal.startingPrice)}
          </Text>
        </View>

        {animal.totalBids > 0 && (
          <View style={styles.bidsContainer}>
            <Ionicons name="people-outline" size={14} color={COLORS.gray} />
            <Text style={styles.bidsText}>
              {animal.totalBids} مزايدة
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    ...SHADOWS.medium,
  },
  imageContainer: {
    position: 'relative',
    height: 140,
    borderTopLeftRadius: SIZES.radius,
    borderTopRightRadius: SIZES.radius,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: SIZES.base,
    left: SIZES.base,
    paddingHorizontal: SIZES.base,
    paddingVertical: 4,
    borderRadius: SIZES.radius / 2,
  },
  statusText: {
    fontSize: SIZES.body5,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  favoriteButton: {
    position: 'absolute',
    top: SIZES.base,
    right: SIZES.base,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  timeText: {
    fontSize: SIZES.body5,
    fontFamily: FONTS.medium,
    color: COLORS.white,
    marginLeft: 4,
  },
  contentContainer: {
    padding: SIZES.padding,
  },
  animalName: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
    marginBottom: 4,
    textAlign: 'right',
  },
  animalType: {
    fontSize: SIZES.body4,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: SIZES.base,
    textAlign: 'right',
  },
  priceContainer: {
    marginBottom: SIZES.base,
  },
  currentBidLabel: {
    fontSize: SIZES.body5,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: 'right',
  },
  currentBidAmount: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    textAlign: 'right',
  },
  bidsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bidsText: {
    fontSize: SIZES.body5,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginLeft: 4,
  },
});

export default AnimalCard;