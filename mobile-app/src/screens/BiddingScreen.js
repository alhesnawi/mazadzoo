import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';
const { COLORS, FONTS, SIZES, SHADOWS } = theme;
import { AuthContext } from '../contexts/AuthContext';
import { AuctionContext } from '../contexts/AuctionContext';
import Button from '../components/Button';
import Loading from '../components/Loading';
import {
  formatCurrency,
  formatTimeRemaining,
  formatDateTime,
  getStatusColor,
  getStatusText,
} from '../utils/helpers';

const BiddingScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { getUserBids, getActiveAuctions } = useContext(AuctionContext);

  const [activeTab, setActiveTab] = useState('myBids'); // 'myBids' or 'activeAuctions'
  const [myBids, setMyBids] = useState([]);
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'myBids') {
        const bidsData = await getUserBids();
        setMyBids(bidsData);
      } else {
        const auctionsData = await getActiveAuctions();
        setActiveAuctions(auctionsData);
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const navigateToAnimalDetail = (animalId) => {
    navigation.navigate('AnimalDetail', { animalId });
  };

  const renderTabButton = (tab, title) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && styles.activeTabButton,
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Text
        style={[
          styles.tabButtonText,
          activeTab === tab && styles.activeTabButtonText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderBidItem = ({ item }) => {
    const isWinning = item.isWinning;
    const isOutbid = item.isOutbid;

    return (
      <TouchableOpacity
        style={styles.bidCard}
        onPress={() => navigateToAnimalDetail(item.animal.id)}
      >
        <View style={styles.bidCardContent}>
          <Image
            source={{ uri: item.animal.images?.[0] || 'placeholder' }}
            style={styles.bidCardImage}
            resizeMode="cover"
          />
          
          <View style={styles.bidCardInfo}>
            <Text style={styles.animalName} numberOfLines={1}>
              {item.animal.name}
            </Text>
            
            <Text style={styles.animalType} numberOfLines={1}>
              {item.animal.type} • {item.animal.breed}
            </Text>

            <View style={styles.bidDetails}>
              <View style={styles.bidRow}>
                <Text style={styles.bidAmount}>{formatCurrency(item.amount)}</Text>
                <Text style={styles.bidLabel}>مزايدتي</Text>
              </View>
              
              <View style={styles.bidRow}>
                <Text style={styles.currentBidAmount}>
                  {formatCurrency(item.animal.currentBid)}
                </Text>
                <Text style={styles.bidLabel}>المزايدة الحالية</Text>
              </View>
            </View>

            <Text style={styles.bidTime}>
              {formatDateTime(item.createdAt)}
            </Text>
          </View>

          <View style={styles.bidStatus}>
            {isWinning && (
              <View style={[styles.statusBadge, { backgroundColor: COLORS.success }]}>
                <Ionicons name="trophy" size={16} color={COLORS.white} />
                <Text style={styles.statusText}>رابح</Text>
              </View>
            )}
            
            {isOutbid && (
              <View style={[styles.statusBadge, { backgroundColor: COLORS.error }]}>
                <Ionicons name="arrow-up" size={16} color={COLORS.white} />
                <Text style={styles.statusText}>تم تجاوزها</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.bidAgainButton}
              onPress={() => navigateToAnimalDetail(item.animal.id)}
            >
              <Text style={styles.bidAgainText}>زايد مرة أخرى</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAuctionItem = ({ item }) => {
    const timeRemaining = formatTimeRemaining(item.auctionEndTime);
    const isEnding = timeRemaining.includes('دقيقة') || timeRemaining.includes('ثانية');

    return (
      <TouchableOpacity
        style={styles.auctionCard}
        onPress={() => navigateToAnimalDetail(item.id)}
      >
        <View style={styles.auctionCardContent}>
          <Image
            source={{ uri: item.images?.[0] || 'placeholder' }}
            style={styles.auctionCardImage}
            resizeMode="cover"
          />
          
          {isEnding && (
            <View style={styles.endingSoonBadge}>
              <Text style={styles.endingSoonText}>ينتهي قريباً</Text>
            </View>
          )}

          <View style={styles.auctionCardInfo}>
            <Text style={styles.animalName} numberOfLines={1}>
              {item.name}
            </Text>
            
            <Text style={styles.animalType} numberOfLines={1}>
              {item.type} • {item.breed}
            </Text>

            <View style={styles.auctionDetails}>
              <View style={styles.priceRow}>
                <Text style={styles.currentBidAmount}>
                  {formatCurrency(item.currentBid || item.startingPrice)}
                </Text>
                <Text style={styles.bidLabel}>المزايدة الحالية</Text>
              </View>

              <View style={styles.timeRow}>
                <Text style={[styles.timeText, isEnding && styles.urgentTimeText]}>
                  {timeRemaining}
                </Text>
                <Ionicons 
                  name="time-outline" 
                  size={16} 
                  color={isEnding ? COLORS.error : COLORS.primary} 
                />
              </View>
            </View>

            {item.totalBids > 0 && (
              <View style={styles.bidsInfo}>
                <Ionicons name="people-outline" size={14} color={COLORS.gray} />
                <Text style={styles.bidsCount}>{item.totalBids} مزايدة</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    const isMyBids = activeTab === 'myBids';
    
    return (
      <View style={styles.emptyState}>
        <Ionicons 
          name={isMyBids ? "receipt-outline" : "hammer-outline"} 
          size={60} 
          color={COLORS.gray} 
        />
        <Text style={styles.emptyStateTitle}>
          {isMyBids ? 'لا توجد مزايدات' : 'لا توجد مزادات نشطة'}
        </Text>
        <Text style={styles.emptyStateMessage}>
          {isMyBids 
            ? 'لم تقم بأي مزايدات بعد. ابدأ بتصفح الحيوانات المتاحة.'
            : 'لا توجد مزادات نشطة حالياً. تحقق مرة أخرى لاحقاً.'
          }
        </Text>
        {isMyBids && (
          <Button
            title="تصفح الحيوانات"
            onPress={() => navigation.navigate('MainTabs')}
            style={styles.emptyStateButton}
          />
        )}
      </View>
    );
  };

  if (!user) {
    return (
      <View style={styles.loginRequired}>
        <Ionicons name="person-outline" size={60} color={COLORS.gray} />
        <Text style={styles.loginRequiredTitle}>تسجيل الدخول مطلوب</Text>
        <Text style={styles.loginRequiredMessage}>
          يجب تسجيل الدخول لعرض المزايدات
        </Text>
        <Button
          title="تسجيل الدخول"
          onPress={() => navigation.navigate('Login')}
          style={styles.loginButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>المزايدات</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {renderTabButton('myBids', 'مزايداتي')}
        {renderTabButton('activeAuctions', 'المزادات النشطة')}
      </View>

      {/* Content */}
      {loading ? (
        <Loading visible text="جاري التحميل..." />
      ) : (
        <FlatList
          data={activeTab === 'myBids' ? myBids : activeAuctions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={activeTab === 'myBids' ? renderBidItem : renderAuctionItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    padding: SIZES.padding,
    paddingTop: 50,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.base,
  },
  tabButton: {
    flex: 1,
    paddingVertical: SIZES.padding,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: COLORS.primary,
  },
  tabButtonText: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
  },
  activeTabButtonText: {
    color: COLORS.primary,
  },
  listContainer: {
    padding: SIZES.padding,
  },
  bidCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    ...SHADOWS.medium,
  },
  bidCardContent: {
    flexDirection: 'row',
    padding: SIZES.padding,
  },
  bidCardImage: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radius,
    marginRight: SIZES.padding,
  },
  bidCardInfo: {
    flex: 1,
  },
  animalName: {
    fontSize: SIZES.body2,
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
  bidDetails: {
    marginBottom: SIZES.base,
  },
  bidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bidLabel: {
    fontSize: SIZES.body4,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  bidAmount: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  currentBidAmount: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
  },
  bidTime: {
    fontSize: SIZES.body5,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: 'right',
  },
  bidStatus: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.base,
    paddingVertical: 4,
    borderRadius: SIZES.radius / 2,
    marginBottom: SIZES.base,
  },
  statusText: {
    fontSize: SIZES.body5,
    fontFamily: FONTS.medium,
    color: COLORS.white,
    marginLeft: 4,
  },
  bidAgainButton: {
    paddingHorizontal: SIZES.base,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SIZES.radius / 2,
  },
  bidAgainText: {
    fontSize: SIZES.body5,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  auctionCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    ...SHADOWS.medium,
  },
  auctionCardContent: {
    position: 'relative',
  },
  auctionCardImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: SIZES.radius,
    borderTopRightRadius: SIZES.radius,
  },
  endingSoonBadge: {
    position: 'absolute',
    top: SIZES.base,
    left: SIZES.base,
    backgroundColor: COLORS.error,
    paddingHorizontal: SIZES.base,
    paddingVertical: 4,
    borderRadius: SIZES.radius / 2,
  },
  endingSoonText: {
    fontSize: SIZES.body5,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  auctionCardInfo: {
    padding: SIZES.padding,
  },
  auctionDetails: {
    marginBottom: SIZES.base,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  timeText: {
    fontSize: SIZES.body4,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginLeft: 4,
  },
  urgentTimeText: {
    color: COLORS.error,
  },
  bidsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bidsCount: {
    fontSize: SIZES.body5,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding * 2,
  },
  emptyStateTitle: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
    marginTop: SIZES.padding,
    marginBottom: SIZES.base,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SIZES.padding,
  },
  emptyStateButton: {
    marginTop: SIZES.padding,
  },
  loginRequired: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding * 2,
  },
  loginRequiredTitle: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
    marginTop: SIZES.padding,
    marginBottom: SIZES.base,
    textAlign: 'center',
  },
  loginRequiredMessage: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SIZES.padding,
  },
  loginButton: {
    marginTop: SIZES.padding,
  },
});

export default BiddingScreen;

