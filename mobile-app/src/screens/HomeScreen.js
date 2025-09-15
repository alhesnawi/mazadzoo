import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';
const { COLORS, FONTS, SIZES, SHADOWS } = theme;
import { useAuth } from '../contexts/AuthContext';
import { AuctionContext } from '../contexts/AuctionContext';
import AnimalCard from '../components/AnimalCard';
import Loading from '../components/Loading';
import Button from '../components/Button';
import {
  formatCurrency,
  formatTimeRemaining,
  getStatusColor,
  getStatusText,
} from '../utils/helpers';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user, isAuthenticated } = useAuth();
  const { 
    animals, 
    loading, 
    loadAnimals, 
    searchAnimals,
    getStats,
    favoriteAnimal,
    unfavoriteAnimal 
  } = useContext(AuctionContext);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredAnimals, setFeaturedAnimals] = useState([]);
  const [recentAnimals, setRecentAnimals] = useState([]);
  const [endingSoonAnimals, setEndingSoonAnimals] = useState([]);
  const [stats, setStats] = useState({
    totalActiveAuctions: 0,
    totalBidders: 0,
    totalCompletedAuctions: 0,
    totalAnimals: 0,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // إذا كانت الـ context methods متوفرة
      if (getStats && loadAnimals) {
        const [statsData, featuredData, recentData, endingSoonData] = await Promise.all([
          getStats(),
          loadAnimals({ featured: true, limit: 5 }),
          loadAnimals({ sortBy: 'createdAt', sortOrder: 'desc', limit: 10 }),
          loadAnimals({ 
            status: 'active', 
            sortBy: 'endTime', 
            sortOrder: 'asc', 
            limit: 8 
          }),
        ]);

        setStats(statsData || {});
        setFeaturedAnimals(featuredData || []);
        setRecentAnimals(recentData || []);
        setEndingSoonAnimals(endingSoonData || []);
      } else {
        // بيانات وهمية للاختبار إذا لم تكن الـ context متوفرة
        setStats({
          totalActiveAuctions: 15,
          totalBidders: 234,
          totalCompletedAuctions: 89,
          totalAnimals: 156,
        });
        
        // يمكنك إضافة بيانات وهمية للحيوانات أيضاً للاختبار
        setFeaturedAnimals([]);
        setRecentAnimals([]);
        setEndingSoonAnimals([]);
      }
    } catch (error) {
      // Handle initial data fetch error
      Alert.alert('خطأ', 'فشل في تحميل البيانات');
      console.log('Error fetching initial data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Auctions', { searchQuery });
    }
  };

  const handleFavorite = async (animalId, isFavorite) => {
    if (!isAuthenticated) {
      Alert.alert('تسجيل الدخول مطلوب', 'يجب تسجيل الدخول لإضافة المفضلة', [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تسجيل الدخول', onPress: () => navigation.navigate('Auth') },
      ]);
      return;
    }

    try {
      if (favoriteAnimal && unfavoriteAnimal) {
        if (isFavorite) {
          await unfavoriteAnimal(animalId);
        } else {
          await favoriteAnimal(animalId);
        }
        // Update local state
        setFeaturedAnimals(prev => prev.map(animal => 
          animal._id === animalId ? { ...animal, isFavorite: !isFavorite } : animal
        ));
        setRecentAnimals(prev => prev.map(animal => 
          animal._id === animalId ? { ...animal, isFavorite: !isFavorite } : animal
        ));
        setEndingSoonAnimals(prev => prev.map(animal => 
          animal._id === animalId ? { ...animal, isFavorite: !isFavorite } : animal
        ));
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تحديث المفضلة');
    }
  };

  const StatCard = ({ icon, number, label, color = COLORS.primary }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const CategoryCard = ({ category, onPress }) => (
    <TouchableOpacity style={styles.categoryCard} onPress={onPress}>
      <View style={styles.categoryIcon}>
        <Ionicons 
          name={category.icon || 'paw-outline'} 
          size={32} 
          color={COLORS.primary} 
        />
      </View>
      <Text style={styles.categoryName}>{category.name}</Text>
      <Text style={styles.categoryCount}>{category.count} حيوان</Text>
    </TouchableOpacity>
  );

  const renderFeaturedAnimal = ({ item }) => (
    <View style={styles.featuredAnimalCard}>
      <AnimalCard
        animal={item}
        onPress={() => navigation.navigate('AnimalDetail', { animalId: item._id })}
        onFavorite={() => handleFavorite(item._id, item.isFavorite)}
        showFavorite={isAuthenticated}
        style={styles.featuredCard}
      />
    </View>
  );

  const renderRecentAnimal = ({ item }) => (
    <AnimalCard
      animal={item}
      onPress={() => navigation.navigate('AnimalDetail', { animalId: item._id })}
      onFavorite={() => handleFavorite(item._id, item.isFavorite)}
      showFavorite={isAuthenticated}
      horizontal
    />
  );

  const quickActions = [
    {
      title: 'جميع المزادات',
      icon: 'hammer-outline',
      color: COLORS.primary,
      onPress: () => navigation.navigate('Auctions'),
    },
    {
      title: 'مزايداتي',
      icon: 'trophy-outline',
      color: COLORS.warning,
      onPress: () => isAuthenticated 
        ? navigation.navigate('Bidding') 
        : navigation.navigate('Auth'),
    },
    {
      title: 'المفضلة',
      icon: 'heart-outline',
      color: COLORS.error,
      onPress: () => isAuthenticated 
        ? navigation.navigate('Favorites') 
        : navigation.navigate('Auth'),
    },
    {
      title: 'الإشعارات',
      icon: 'notifications-outline',
      color: COLORS.info,
      onPress: () => isAuthenticated 
        ? navigation.navigate('Notifications') 
        : navigation.navigate('Auth'),
    },
  ];

  const categories = [
    { name: 'طيور', icon: 'airplane-outline', count: 15 },
    { name: 'زواحف', icon: 'bug-outline', count: 8 },
    { name: 'ثدييات', icon: 'paw-outline', count: 12 },
    { name: 'أسماك', icon: 'fish-outline', count: 6 },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.welcomeText}>
                {isAuthenticated ? `مرحباً، ${user?.name || 'المستخدم'}` : 'مرحباً بك'}
              </Text>
              <Text style={styles.headerTitle}>مزاد الحيوانات النادرة</Text>
            </View>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => isAuthenticated 
                ? navigation.navigate('Profile') 
                : navigation.navigate('Auth')
              }
            >
              <Ionicons 
                name={isAuthenticated ? 'person' : 'person-outline'} 
                size={24} 
                color={COLORS.white} 
              />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={COLORS.gray} />
              <TextInput
                style={styles.searchInput}
                placeholder="ابحث عن الحيوانات..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                textAlign="right"
                placeholderTextColor={COLORS.gray}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={COLORS.gray} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => navigation.navigate('Auctions')}
            >
              <Ionicons name="options" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
          >
            <StatCard
              icon="hammer"
              number={stats.totalActiveAuctions || 0}
              label="مزاد نشط"
              color={COLORS.primary}
            />
            <StatCard
              icon="people"
              number={stats.totalBidders || 0}
              label="مزايد"
              color={COLORS.info}
            />
            <StatCard
              icon="trophy"
              number={stats.totalCompletedAuctions || 0}
              label="مزاد مكتمل"
              color={COLORS.warning}
            />
            <StatCard
              icon="paw"
              number={stats.totalAnimals || 0}
              label="حيوان متاح"
              color={COLORS.success}
            />
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الإجراءات السريعة</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionCard}
                onPress={action.onPress}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>الفئات</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Auctions')}>
              <Text style={styles.seeAllText}>عرض الكل</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category, index) => (
              <CategoryCard
                key={index}
                category={category}
                onPress={() => navigation.navigate('Auctions', { category: category.name })}
              />
            ))}
          </ScrollView>
        </View>

        {/* Featured Animals */}
        {featuredAnimals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>المزادات المميزة</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Auctions', { featured: true })}>
                <Text style={styles.seeAllText}>عرض الكل</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={featuredAnimals}
              renderItem={renderFeaturedAnimal}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredContainer}
            />
          </View>
        )}

        {/* Ending Soon */}
        {endingSoonAnimals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>ينتهي قريباً</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Auctions', { endingSoon: true })}>
                <Text style={styles.seeAllText}>عرض الكل</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.endingSoonContainer}
            >
              {endingSoonAnimals.map((animal) => (
                <View key={animal._id} style={styles.endingSoonCard}>
                  <AnimalCard
                    animal={animal}
                    onPress={() => navigation.navigate('AnimalDetail', { animalId: animal._id })}
                    onFavorite={() => handleFavorite(animal._id, animal.isFavorite)}
                    showFavorite={isAuthenticated}
                    compact
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Animals */}
        {recentAnimals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>المضافة حديثاً</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Auctions', { recent: true })}>
                <Text style={styles.seeAllText}>عرض الكل</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={recentAnimals}
              renderItem={renderRecentAnimal}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Call to Action */}
        {!isAuthenticated && (
          <View style={styles.ctaSection}>
            <View style={styles.ctaCard}>
              <Ionicons name="person-add" size={48} color={COLORS.primary} />
              <Text style={styles.ctaTitle}>انضم إلى مجتمع المزايدين</Text>
              <Text style={styles.ctaSubtitle}>
                سجل الآن واحصل على فرصة للمزايدة على أندر الحيوانات
              </Text>
              <Button
                title="إنشاء حساب"
                style={styles.ctaButton}
                onPress={() => navigation.navigate('Auth')}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {loading && <Loading visible text="جاري تحميل البيانات..." />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.body1,
    fontFamily: FONTS.regular,
    color: COLORS.black,
    marginLeft: 12,
    textAlign: 'right',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsSection: {
    marginTop: 20,
  },
  statsContainer: {
    paddingHorizontal: SIZES.padding,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    alignItems: 'center',
    minWidth: 120,
    ...SHADOWS.light,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: 'center',
  },
  section: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  seeAllText: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIZES.padding,
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - SIZES.padding * 2 - 12) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    ...SHADOWS.light,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.black,
    textAlign: 'center',
  },
  categoriesContainer: {
    paddingHorizontal: SIZES.padding,
  },
  categoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    alignItems: 'center',
    minWidth: 120,
    ...SHADOWS.light,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  featuredContainer: {
    paddingHorizontal: SIZES.padding,
  },
  featuredAnimalCard: {
    marginRight: 16,
    width: width * 0.8,
  },
  featuredCard: {
    width: '100%',
  },
  endingSoonContainer: {
    paddingHorizontal: SIZES.padding,
  },
  endingSoonCard: {
    marginRight: 16,
    width: width * 0.7,
  },
  ctaSection: {
    marginTop: 32,
    marginBottom: 32,
    paddingHorizontal: SIZES.padding,
  },
  ctaCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  ctaTitle: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  ctaButton: {
    paddingHorizontal: 32,
  },
});

export default HomeScreen;