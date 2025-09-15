import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';

const COLORS = {
  primary: '#1a472a',
  secondary: '#4a7c59',
  background: '#f8f9fa',
  white: '#ffffff',
  black: '#000000',
  gray: '#6c757d',
  lightGray: '#e9ecef',
  text: '#212529',
  success: '#28a745',
  warning: '#ffc107',
  error: '#dc3545',
  info: '#17a2b8',
};

export default function MyListingsScreen({ navigation }) {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // active, sold, expired

  useEffect(() => {
    if (isAuthenticated) {
      loadListings();
    }
  }, [isAuthenticated, activeTab]);

  const loadListings = async () => {
    try {
      setLoading(true);
      // Simulated API call - replace with actual API
      const mockListings = [
        {
          _id: '1',
          name: 'نمر سيبيري نادر',
          nameEn: 'Rare Siberian Tiger',
          species: 'Panthera tigris altaica',
          currentBid: 50000,
          startingPrice: 30000,
          endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          image: 'https://example.com/tiger.jpg',
          status: 'active',
          bidCount: 15,
          views: 234,
        },
        {
          _id: '2',
          name: 'ببغاء أزرق نادر',
          nameEn: 'Rare Blue Parrot',
          species: 'Anodorhynchus hyacinthinus',
          currentBid: 8000,
          startingPrice: 5000,
          endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          image: 'https://example.com/parrot.jpg',
          status: 'sold',
          bidCount: 8,
          views: 156,
          soldPrice: 8500,
        },
        {
          _id: '3',
          name: 'سلحفاة غالاباغوس',
          nameEn: 'Galapagos Tortoise',
          species: 'Chelonoidis nigra',
          currentBid: 0,
          startingPrice: 15000,
          endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          image: 'https://example.com/tortoise.jpg',
          status: 'expired',
          bidCount: 0,
          views: 89,
        },
      ];
      
      const filteredListings = mockListings.filter(listing => listing.status === activeTab);
      setListings(filteredListings);
    } catch (error) {
      // Handle listings loading error
      Alert.alert('خطأ', 'فشل في تحميل القوائم');
    } finally {
        setLoading(false);
        setRefreshing(false);
      }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadListings();
  };

  const handleEditListing = (listingId) => {
    Alert.alert(
      'تعديل القائمة',
      'هل تريد تعديل هذه القائمة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تعديل', onPress: () => {
          // Navigate to edit screen
          // Handle edit listing
        }}
      ]
    );
  };

  const handleDeleteListing = (listingId) => {
    Alert.alert(
      'حذف القائمة',
      'هل أنت متأكد من حذف هذه القائمة؟ لا يمكن التراجع عن هذا الإجراء.',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'حذف', style: 'destructive', onPress: () => {
          setListings(prev => prev.filter(listing => listing._id !== listingId));
        }}
      ]
    );
  };

  const handlePromoteListing = (listingId) => {
    Alert.alert(
      'ترويج القائمة',
      'هل تريد ترويج هذه القائمة لزيادة الرؤية؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'ترويج', onPress: () => {
          // Handle promote listing
        }}
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return COLORS.success;
      case 'sold': return COLORS.info;
      case 'expired': return COLORS.error;
      default: return COLORS.gray;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'sold': return 'مباع';
      case 'expired': return 'منتهي';
      default: return 'غير معروف';
    }
  };

  const formatTimeRemaining = (endTime) => {
    const now = new Date();
    const diff = endTime - now;
    
    if (diff <= 0) return 'انتهى';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} يوم`;
    return `${hours} ساعة`;
  };

  const renderListingCard = ({ item }) => (
    <View style={styles.listingCard}>
      <Image source={{ uri: item.image }} style={styles.listingImage} />
      
      <View style={styles.listingContent}>
        <View style={styles.listingHeader}>
          <View style={styles.listingInfo}>
            <Text style={styles.listingName}>{item.name}</Text>
            <Text style={styles.listingNameEn}>{item.nameEn}</Text>
            <Text style={styles.listingSpecies}>{item.species}</Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
        
        <View style={styles.listingStats}>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={16} color={COLORS.gray} />
            <Text style={styles.statText}>{item.views} مشاهدة</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="hammer-outline" size={16} color={COLORS.gray} />
            <Text style={styles.statText}>{item.bidCount} مزايدة</Text>
          </View>
          {item.status === 'active' && (
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color={COLORS.warning} />
              <Text style={styles.statText}>{formatTimeRemaining(item.endTime)}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.priceSection}>
          <View style={styles.priceInfo}>
            <Text style={styles.priceLabel}>السعر الحالي:</Text>
            <Text style={styles.currentPrice}>
              {item.status === 'sold' ? item.soldPrice : item.currentBid} ريال
            </Text>
          </View>
          <Text style={styles.startingPrice}>
            السعر الابتدائي: {item.startingPrice} ريال
          </Text>
        </View>
        
        <View style={styles.actionButtons}>
          {item.status === 'active' && (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleEditListing(item._id)}
              >
                <Ionicons name="create-outline" size={16} color={COLORS.white} />
                <Text style={styles.actionButtonText}>تعديل</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.promoteButton]}
                onPress={() => handlePromoteListing(item._id)}
              >
                <Ionicons name="trending-up-outline" size={16} color={COLORS.white} />
                <Text style={styles.actionButtonText}>ترويج</Text>
              </TouchableOpacity>
            </>
          )}
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteListing(item._id)}
          >
            <Ionicons name="trash-outline" size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>حذف</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const TabButton = ({ title, isActive, onPress }) => (
    <TouchableOpacity 
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
    >
      <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>قوائمي</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.loginPrompt}>
          <Ionicons name="log-in-outline" size={64} color={COLORS.gray} />
          <Text style={styles.loginTitle}>تسجيل الدخول مطلوب</Text>
          <Text style={styles.loginSubtitle}>
            يجب تسجيل الدخول لعرض قوائمك
          </Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>قوائمي</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {/* Handle add new listing */}}
        >
          <Ionicons name="add" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TabButton 
          title="نشط"
          isActive={activeTab === 'active'}
          onPress={() => setActiveTab('active')}
        />
        <TabButton 
          title="مباع"
          isActive={activeTab === 'sold'}
          onPress={() => setActiveTab('sold')}
        />
        <TabButton 
          title="منتهي"
          isActive={activeTab === 'expired'}
          onPress={() => setActiveTab('expired')}
        />
      </View>

      {/* Content */}
      {listings.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="list-outline" size={64} color={COLORS.gray} />
          <Text style={styles.emptyTitle}>لا توجد قوائم</Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'active' && 'لم تقم بإنشاء أي قوائم نشطة بعد'}
            {activeTab === 'sold' && 'لا توجد قوائم مباعة'}
            {activeTab === 'expired' && 'لا توجد قوائم منتهية'}
          </Text>
          {activeTab === 'active' && (
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => {/* Handle create new listing */}}
            >
              <Text style={styles.createButtonText}>إنشاء قائمة جديدة</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={listings}
          renderItem={renderListingCard}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
  },
  tabButtonText: {
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: COLORS.white,
  },
  listContainer: {
    padding: 20,
  },
  listingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listingImage: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.lightGray,
  },
  listingContent: {
    padding: 15,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  listingInfo: {
    flex: 1,
  },
  listingName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  listingNameEn: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 5,
  },
  listingSpecies: {
    fontSize: 12,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  listingStats: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 4,
  },
  priceSection: {
    marginBottom: 15,
  },
  priceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  startingPrice: {
    fontSize: 12,
    color: COLORS.gray,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 2,
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: COLORS.info,
  },
  promoteButton: {
    backgroundColor: COLORS.warning,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 10,
  },
  loginSubtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  loginButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});