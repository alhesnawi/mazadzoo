import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  FlatList,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import theme from '../constants/theme';
const { COLORS, FONTS, SIZES, SHADOWS } = theme;
import LoadingSpinner from '../components/LoadingSpinner';
import BidModal from '../components/modals/BidModal';
import { mockApiService } from '../services/mockData';

const { width, height } = Dimensions.get('window');

const AnimalDetailScreen = ({ route, navigation }) => {
  const { animalId } = route.params;
  const { user } = useContext(AuthContext);
  const { placeBid, getAnimalDetails, getAnimalBids } = useContext(AuctionContext);

  const [animal, setAnimal] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');
  const [placingBid, setPlacingBid] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadAnimalDetails();
    loadBids();
  }, [animalId]);

  useEffect(() => {
    if (animal?.auctionEndTime) {
      const updateTimer = () => {
        setTimeRemaining(formatTimeRemaining(animal.auctionEndTime));
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    }
  }, [animal?.auctionEndTime]);

  const loadAnimalDetails = async () => {
    try {
      const animalData = await getAnimalDetails(animalId);
      setAnimal(animalData);
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تحميل تفاصيل الحيوان');
    } finally {
      setLoading(false);
    }
  };

  const loadBids = async () => {
    try {
      const bidsData = await getAnimalBids(animalId);
      setBids(bidsData);
    } catch (error) {
      // Handle bid loading error
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadAnimalDetails(), loadBids()]);
    setRefreshing(false);
  };

  const handleBidSubmit = async () => {
    if (!user) {
      Alert.alert('تسجيل الدخول مطلوب', 'يجب تسجيل الدخول للمزايدة');
      return;
    }

    const validation = validateBid(bidAmount, animal.currentBid || animal.startingPrice);
    if (!validation.isValid) {
      setBidError(validation.message);
      return;
    }

    setPlacingBid(true);
    setBidError('');

    try {
      await placeBid(animalId, parseFloat(bidAmount));
      setBidAmount('');
      setShowBidModal(false);
      await Promise.all([loadAnimalDetails(), loadBids()]);
      Alert.alert('نجح', 'تم تقديم المزايدة بنجاح');
    } catch (error) {
      setBidError(error.message || 'فشل في تقديم المزايدة');
    } finally {
      setPlacingBid(false);
    }
  };

  const openImageModal = (index) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const isAuctionActive = () => {
    if (!animal?.auctionEndTime) return false;
    return new Date() < new Date(animal.auctionEndTime);
  };

  const canBid = () => {
    return user && isAuctionActive() && animal?.status === 'active';
  };

  const renderImageGallery = () => {
    if (!animal?.images || animal.images.length === 0) {
      return (
        <View style={styles.placeholderImage}>
          <Ionicons name="image-outline" size={60} color={COLORS.gray} />
          <Text style={styles.placeholderText}>لا توجد صور</Text>
        </View>
      );
    }

    return (
      <View style={styles.imageGallery}>
        <TouchableOpacity onPress={() => openImageModal(0)}>
          <Image
            source={{ uri: animal.images[0] }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
        
        {animal.images.length > 1 && (
          <FlatList
            data={animal.images.slice(1, 4)}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            style={styles.thumbnailList}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => openImageModal(index + 1)}>
                <Image
                  source={{ uri: item }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
          />
        )}
        
        {animal.images.length > 4 && (
          <TouchableOpacity
            style={styles.moreImagesOverlay}
            onPress={() => openImageModal(0)}
          >
            <Text style={styles.moreImagesText}>+{animal.images.length - 4}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderBidItem = ({ item }) => (
    <View style={styles.bidItem}>
      <View style={styles.bidInfo}>
        <Text style={styles.bidderName}>{item.bidder?.name || 'مزايد'}</Text>
        <Text style={styles.bidTime}>{formatDateTime(item.createdAt)}</Text>
      </View>
      <Text style={styles.bidAmount}>{formatCurrency(item.amount)}</Text>
    </View>
  );

  if (loading) {
    return <Loading visible text="جاري تحميل تفاصيل الحيوان..." />;
  }

  if (!animal) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color={COLORS.error} />
        <Text style={styles.errorText}>لم يتم العثور على الحيوان</Text>
        <Button title="العودة" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? COLORS.error : COLORS.black}
            />
          </TouchableOpacity>
        </View>

        {/* Image Gallery */}
        {renderImageGallery()}

        {/* Animal Info */}
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(animal.status) }]}>
              <Text style={styles.statusText}>{getStatusText(animal.status)}</Text>
            </View>
            <Text style={styles.animalName}>{animal.name}</Text>
          </View>

          <Text style={styles.animalType}>{animal.type} • {animal.breed}</Text>

          {/* Price Info */}
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.currentBidAmount}>
                {formatCurrency(animal.currentBid || animal.startingPrice)}
              </Text>
              <Text style={styles.currentBidLabel}>المزايدة الحالية</Text>
            </View>
            
            {animal.totalBids > 0 && (
              <Text style={styles.bidsCount}>{animal.totalBids} مزايدة</Text>
            )}
          </View>

          {/* Time Remaining */}
          {isAuctionActive() && (
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={20} color={COLORS.primary} />
              <Text style={styles.timeText}>الوقت المتبقي: {timeRemaining}</Text>
            </View>
          )}

          {/* Description */}
          {animal.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionTitle}>الوصف</Text>
              <Text style={styles.description}>{animal.description}</Text>
            </View>
          )}

          {/* Animal Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.sectionTitle}>التفاصيل</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailValue}>{animal.age || 'غير محدد'}</Text>
              <Text style={styles.detailLabel}>العمر</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailValue}>{animal.gender || 'غير محدد'}</Text>
              <Text style={styles.detailLabel}>الجنس</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailValue}>{animal.location || 'غير محدد'}</Text>
              <Text style={styles.detailLabel}>الموقع</Text>
            </View>
          </View>

          {/* Recent Bids */}
          {bids.length > 0 && (
            <View style={styles.bidsContainer}>
              <Text style={styles.sectionTitle}>المزايدات الأخيرة</Text>
              <FlatList
                data={bids.slice(0, 5)}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderBidItem}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bid Button */}
      {canBid() && (
        <View style={styles.bidButtonContainer}>
          <Button
            title="تقديم مزايدة"
            onPress={() => setShowBidModal(true)}
            style={styles.bidButton}
          />
        </View>
      )}

      {/* Bid Modal */}
      <Modal
        visible={showBidModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowBidModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>تقديم مزايدة</Text>
            
            <Text style={styles.currentBidInfo}>
              المزايدة الحالية: {formatCurrency(animal.currentBid || animal.startingPrice)}
            </Text>

            <Input
              label="مبلغ المزايدة"
              placeholder="أدخل مبلغ المزايدة"
              value={bidAmount}
              onChangeText={setBidAmount}
              keyboardType="numeric"
              error={bidError}
            />

            <View style={styles.modalButtons}>
              <Button
                title="إلغاء"
                variant="outline"
                onPress={() => setShowBidModal(false)}
                style={styles.modalButton}
              />
              <Button
                title="تأكيد المزايدة"
                onPress={handleBidSubmit}
                loading={placingBid}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Image Modal */}
      <Modal
        visible={showImageModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.imageModalContainer}>
          <TouchableOpacity
            style={styles.imageModalClose}
            onPress={() => setShowImageModal(false)}
          >
            <Ionicons name="close" size={30} color={COLORS.white} />
          </TouchableOpacity>
          
          <FlatList
            data={animal.images}
            horizontal
            pagingEnabled
            initialScrollIndex={selectedImageIndex}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            )}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
  },
  imageGallery: {
    marginBottom: SIZES.padding,
  },
  mainImage: {
    width: width,
    height: 250,
  },
  thumbnailList: {
    paddingHorizontal: SIZES.padding,
    marginTop: SIZES.base,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: SIZES.radius,
    marginRight: SIZES.base,
  },
  moreImagesOverlay: {
    position: 'absolute',
    bottom: SIZES.base,
    right: SIZES.padding + 180,
    width: 60,
    height: 60,
    borderRadius: SIZES.radius,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreImagesText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: SIZES.body3,
  },
  placeholderImage: {
    width: width,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lightGray2,
  },
  placeholderText: {
    fontSize: SIZES.body3,
    color: COLORS.gray,
    marginTop: SIZES.base,
  },
  infoContainer: {
    padding: SIZES.padding,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.base,
  },
  animalName: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.radius,
    marginLeft: SIZES.base,
  },
  statusText: {
    fontSize: SIZES.body4,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  animalType: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: SIZES.padding,
    textAlign: 'right',
  },
  priceContainer: {
    backgroundColor: COLORS.lightGray2,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentBidLabel: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  currentBidAmount: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  bidsCount: {
    fontSize: SIZES.body4,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginTop: SIZES.base / 2,
    textAlign: 'right',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: COLORS.lightGray2,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
  },
  timeText: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginLeft: SIZES.base,
  },
  descriptionContainer: {
    marginBottom: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
    marginBottom: SIZES.base,
    textAlign: 'right',
  },
  description: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    lineHeight: 22,
    textAlign: 'right',
  },
  detailsContainer: {
    marginBottom: SIZES.padding,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  detailLabel: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  detailValue: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  bidsContainer: {
    marginBottom: SIZES.padding,
  },
  bidItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  bidInfo: {
    flex: 1,
  },
  bidderName: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.medium,
    color: COLORS.black,
    textAlign: 'right',
  },
  bidTime: {
    fontSize: SIZES.body4,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: 'right',
  },
  bidAmount: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  bidButtonContainer: {
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  bidButton: {
    width: '100%',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 2,
    width: width - SIZES.padding * 2,
    maxHeight: height * 0.8,
  },
  modalTitle: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: SIZES.padding,
  },
  currentBidInfo: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SIZES.padding,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.padding,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SIZES.base / 2,
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  imageModalClose: {
    position: 'absolute',
    top: 50,
    right: SIZES.padding,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenImage: {
    width: width,
    height: height,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding,
  },
  errorText: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    textAlign: 'center',
    marginVertical: SIZES.padding,
  },
});

export default AnimalDetailScreen;

