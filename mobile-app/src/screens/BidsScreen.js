import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function BidsScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // active, won, lost

  useEffect(() => {
    if (isAuthenticated) {
      loadBids();
    }
  }, [isAuthenticated, activeTab]);

  const loadBids = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockBids = [
        {
          id: '1',
          animalId: 'animal1',
          animalName: 'أسد أفريقي نادر',
          animalNameEn: 'Rare African Lion',
          bidAmount: 15000,
          currentHighestBid: 18000,
          status: 'outbid',
          bidTime: new Date('2024-01-15T10:30:00'),
          auctionEndTime: new Date('2024-01-20T18:00:00'),
          emoji: '🦁',
        },
        {
          id: '2',
          animalId: 'animal2',
          animalName: 'نمر سيبيري',
          animalNameEn: 'Siberian Tiger',
          bidAmount: 25000,
          currentHighestBid: 25000,
          status: 'winning',
          bidTime: new Date('2024-01-16T14:20:00'),
          auctionEndTime: new Date('2024-01-22T20:00:00'),
          emoji: '🐅',
        },
      ];
      
      const filteredBids = mockBids.filter(bid => {
        if (activeTab === 'active') return bid.status === 'winning' || bid.status === 'outbid';
        if (activeTab === 'won') return bid.status === 'won';
        if (activeTab === 'lost') return bid.status === 'lost';
        return true;
      });
      
      setBids(filteredBids);
    } catch (error) {
      // Handle bid loading error
      Alert.alert(
        'خطأ / Error',
        'فشل في تحميل المزايدات\nFailed to load bids'
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBids();
    setRefreshing(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-SA').format(price || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'winning': return '#4CAF50';
      case 'outbid': return '#FF9800';
      case 'won': return '#2196F3';
      case 'lost': return '#F44336';
      default: return '#757575';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'winning': return 'رابح / Winning';
      case 'outbid': return 'تم التفوق عليك / Outbid';
      case 'won': return 'فائز / Won';
      case 'lost': return 'خاسر / Lost';
      default: return 'غير معروف / Unknown';
    }
  };

  const renderBidItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bidCard}
      onPress={() => navigation.navigate('AnimalDetail', { animalId: item.animalId })}
    >
      <View style={styles.bidHeader}>
        <View style={styles.animalInfo}>
          <Text style={styles.animalEmoji}>{item.emoji}</Text>
          <View style={styles.animalNames}>
            <Text style={styles.animalName}>{item.animalName}</Text>
            <Text style={styles.animalNameEn}>{item.animalNameEn}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.bidDetails}>
        <View style={styles.bidRow}>
          <Text style={styles.bidLabel}>مزايدتك / Your Bid:</Text>
          <Text style={styles.bidAmount}>{formatPrice(item.bidAmount)} ريال</Text>
        </View>
        <View style={styles.bidRow}>
          <Text style={styles.bidLabel}>أعلى مزايدة / Highest Bid:</Text>
          <Text style={styles.currentBid}>{formatPrice(item.currentHighestBid)} ريال</Text>
        </View>
        <View style={styles.bidRow}>
          <Text style={styles.bidLabel}>وقت المزايدة / Bid Time:</Text>
          <Text style={styles.bidTime}>{item.bidTime.toLocaleString('ar-SA')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTabButton = (tab, title) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>مزايداتي / My Bids</Text>
        </View>
        <View style={styles.notAuthenticatedContainer}>
          <Ionicons name="lock-closed-outline" size={64} color="#ccc" />
          <Text style={styles.notAuthenticatedText}>
            يرجى تسجيل الدخول لعرض مزايداتك
          </Text>
          <Text style={styles.notAuthenticatedText}>
            Please login to view your bids
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.loginButtonText}>تسجيل الدخول / Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>مزايداتي / My Bids</Text>
      </View>

      <View style={styles.tabContainer}>
        {renderTabButton('active', 'نشطة / Active')}
        {renderTabButton('won', 'فائزة / Won')}
        {renderTabButton('lost', 'خاسرة / Lost')}
      </View>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={bids}
          renderItem={renderBidItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="hammer-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>لا توجد مزايدات</Text>
              <Text style={styles.emptyText}>No bids found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a472a',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
    backgroundColor: '#0f2f1a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#2d5a3d',
    margin: 16,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#4a7c59',
  },
  tabText: {
    fontSize: 14,
    color: '#ccc',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  bidCard: {
    backgroundColor: '#2d5a3d',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4a7c59',
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  animalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  animalEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  animalNames: {
    flex: 1,
  },
  animalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  animalNameEn: {
    fontSize: 14,
    color: '#ccc',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  bidDetails: {
    borderTopWidth: 1,
    borderTopColor: '#4a7c59',
    paddingTop: 12,
  },
  bidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bidLabel: {
    fontSize: 14,
    color: '#ccc',
  },
  bidAmount: {
    fontSize: 14,
    color: '#90EE90',
    fontWeight: 'bold',
  },
  currentBid: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  bidTime: {
    fontSize: 14,
    color: '#ccc',
  },
  notAuthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  notAuthenticatedText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 16,
  },
  loginButton: {
    backgroundColor: '#4a7c59',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 16,
  },
});