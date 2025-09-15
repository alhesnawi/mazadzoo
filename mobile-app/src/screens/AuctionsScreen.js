import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';
const { COLORS, FONTS, SIZES, SHADOWS } = theme;
import { AuthContext } from '../contexts/AuthContext';
import { AuctionContext } from '../contexts/AuctionContext';
import AnimalCard from '../components/AnimalCard';
import Loading from '../components/Loading';
import Button from '../components/Button';
import Input from '../components/Input';
import {
  formatCurrency,
  formatTimeRemaining,
  getStatusColor,
  getStatusText,
} from '../utils/helpers';

const AuctionsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { 
    animals, 
    loading, 
    loadAnimals, 
    searchAnimals,
    getCategories,
    favoriteAnimal,
    unfavoriteAnimal 
  } = useContext(AuctionContext);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    status: 'active',
    breed: '',
    location: '',
  });
  const [sortBy, setSortBy] = useState('endTime');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [filters, sortBy, sortOrder]);

  const fetchInitialData = async () => {
    try {
      const [animalsData, categoriesData] = await Promise.all([
        loadAnimals(),
        getCategories(),
      ]);
      setCategories(categoriesData || []);
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تحميل البيانات');
    }
  };

  const applyFiltersAndSort = async () => {
    try {
      const params = {
        search: searchQuery,
        category: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        status: filters.status,
        breed: filters.breed,
        location: filters.location,
        sortBy,
        sortOrder,
        limit: 50,
      };
      
      if (searchQuery) {
        await searchAnimals(searchQuery, params);
      } else {
        await loadAnimals(params);
      }
    } catch (error) {
      // Handle filter application error
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  const handleSearch = () => {
    applyFiltersAndSort();
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      status: 'active',
      breed: '',
      location: '',
    });
    setSearchQuery('');
    setSortBy('endTime');
    setSortOrder('asc');
  };

  const handleFavorite = async (animalId, isFavorite) => {
    try {
      if (isFavorite) {
        await unfavoriteAnimal(animalId);
      } else {
        await favoriteAnimal(animalId);
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تحديث المفضلة');
    }
  };

  const FilterModal = () => (
    <Modal
      visible={filterVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setFilterVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>تصفية النتائج</Text>
            <TouchableOpacity onPress={() => setFilterVisible(false)}>
              <Ionicons name="close" size={24} color={COLORS.gray} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.filterContent} showsVerticalScrollIndicator={false}>
            {/* Category Filter */}
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>الفئة</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryButtons}>
                  <TouchableOpacity
                    style={[
                      styles.categoryButton,
                      !filters.category && styles.selectedCategory
                    ]}
                    onPress={() => setFilters(prev => ({ ...prev, category: '' }))}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      !filters.category && styles.selectedCategoryText
                    ]}>
                      الكل
                    </Text>
                  </TouchableOpacity>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category._id}
                      style={[
                        styles.categoryButton,
                        filters.category === category.name && styles.selectedCategory
                      ]}
                      onPress={() => setFilters(prev => ({ ...prev, category: category.name }))}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        filters.category === category.name && styles.selectedCategoryText
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            
            {/* Price Range Filter */}
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>نطاق السعر</Text>
              <View style={styles.priceInputs}>
                <Input
                  placeholder="الحد الأدنى"
                  value={filters.minPrice}
                  onChangeText={(value) => setFilters(prev => ({ ...prev, minPrice: value }))}
                  keyboardType="numeric"
                  style={styles.priceInput}
                />
                <Text style={styles.priceSeparator}>إلى</Text>
                <Input
                  placeholder="الحد الأقصى"
                  value={filters.maxPrice}
                  onChangeText={(value) => setFilters(prev => ({ ...prev, maxPrice: value }))}
                  keyboardType="numeric"
                  style={styles.priceInput}
                />
              </View>
            </View>

            {/* Status Filter */}
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>حالة المزاد</Text>
              <View style={styles.statusButtons}>
                {[
                  { key: 'active', label: 'نشط' },
                  { key: 'ended', label: 'منتهي' },
                  { key: 'upcoming', label: 'قادم' },
                ].map((status) => (
                  <TouchableOpacity
                    key={status.key}
                    style={[
                      styles.statusButton,
                      filters.status === status.key && styles.selectedStatus
                    ]}
                    onPress={() => setFilters(prev => ({ ...prev, status: status.key }))}
                  >
                    <Text style={[
                      styles.statusButtonText,
                      filters.status === status.key && styles.selectedStatusText
                    ]}>
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Breed Filter */}
            <View style={styles.filterGroup}>
              <Input
                label="السلالة"
                placeholder="أدخل السلالة"
                value={filters.breed}
                onChangeText={(value) => setFilters(prev => ({ ...prev, breed: value }))}
                leftIcon="paw-outline"
              />
            </View>

            {/* Location Filter */}
            <View style={styles.filterGroup}>
              <Input
                label="الموقع"
                placeholder="أدخل الموقع"
                value={filters.location}
                onChangeText={(value) => setFilters(prev => ({ ...prev, location: value }))}
                leftIcon="location-outline"
              />
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <Button
              title="مسح الفلاتر"
              style={[styles.modalButton, styles.clearButton]}
              textStyle={styles.clearButtonText}
              onPress={clearFilters}
            />
            <Button
              title="تطبيق"
              style={[styles.modalButton, styles.applyButton]}
              onPress={() => {
                setFilterVisible(false);
                applyFiltersAndSort();
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const SortModal = () => (
    <Modal
      visible={sortVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setSortVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>ترتيب النتائج</Text>
            <TouchableOpacity onPress={() => setSortVisible(false)}>
              <Ionicons name="close" size={24} color={COLORS.gray} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.sortContent}>
            {[
              { key: 'endTime', label: 'وقت انتهاء المزاد', icon: 'time-outline' },
              { key: 'currentBid', label: 'المزايدة الحالية', icon: 'trending-up-outline' },
              { key: 'createdAt', label: 'تاريخ الإضافة', icon: 'calendar-outline' },
              { key: 'name', label: 'الاسم', icon: 'text-outline' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.sortOption,
                  sortBy === option.key && styles.selectedSortOption
                ]}
                onPress={() => setSortBy(option.key)}
              >
                <View style={styles.sortOptionLeft}>
                  <Ionicons 
                    name={option.icon} 
                    size={20} 
                    color={sortBy === option.key ? COLORS.primary : COLORS.gray} 
                  />
                  <Text style={[
                    styles.sortOptionText,
                    sortBy === option.key && styles.selectedSortOptionText
                  ]}>
                    {option.label}
                  </Text>
                </View>
                {sortBy === option.key && (
                  <TouchableOpacity
                    onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    <Ionicons 
                      name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                      size={20} 
                      color={COLORS.primary} 
                    />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.modalActions}>
            <Button
              title="تطبيق"
              style={styles.fullWidthButton}
              onPress={() => {
                setSortVisible(false);
                applyFiltersAndSort();
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderAnimalCard = ({ item }) => (
    <AnimalCard
      animal={item}
      onPress={() => navigation.navigate('AnimalDetail', { animalId: item._id })}
      onFavorite={() => handleFavorite(item._id, item.isFavorite)}
      showFavorite={!!user}
    />
  );

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.status !== 'active') count++;
    if (filters.breed) count++;
    if (filters.location) count++;
    return count;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>جميع المزادات</Text>
        <Text style={styles.headerSubtitle}>
          {animals.length} حيوان متاح
        </Text>
      </View>

      {/* Search and Filter */}
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
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              applyFiltersAndSort();
            }}>
              <Ionicons name="close-circle" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, getActiveFiltersCount() > 0 && styles.activeActionButton]}
            onPress={() => setFilterVisible(true)}
          >
            <Ionicons 
              name="options" 
              size={20} 
              color={getActiveFiltersCount() > 0 ? COLORS.white : COLORS.primary} 
            />
            {getActiveFiltersCount() > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setSortVisible(true)}
          >
            <Ionicons name="swap-vertical" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <View style={styles.activeFiltersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.activeFilters}>
              {filters.category && (
                <View style={styles.activeFilter}>
                  <Text style={styles.activeFilterText}>{filters.category}</Text>
                  <TouchableOpacity 
                    onPress={() => setFilters(prev => ({ ...prev, category: '' }))}
                  >
                    <Ionicons name="close" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <View style={styles.activeFilter}>
                  <Text style={styles.activeFilterText}>
                    {filters.minPrice && filters.maxPrice 
                      ? `${filters.minPrice} - ${filters.maxPrice}`
                      : filters.minPrice 
                        ? `من ${filters.minPrice}`
                        : `إلى ${filters.maxPrice}`
                    }
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setFilters(prev => ({ ...prev, minPrice: '', maxPrice: '' }))}
                  >
                    <Ionicons name="close" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              )}
              {filters.status !== 'active' && (
                <View style={styles.activeFilter}>
                  <Text style={styles.activeFilterText}>
                    {filters.status === 'ended' ? 'منتهي' : 'قادم'}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setFilters(prev => ({ ...prev, status: 'active' }))}
                  >
                    <Ionicons name="close" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
          <TouchableOpacity style={styles.clearAllFilters} onPress={clearFilters}>
            <Text style={styles.clearAllFiltersText}>مسح الكل</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Animals List */}
      {loading ? (
        <Loading visible text="جاري تحميل المزادات..." />
      ) : (
        <FlatList
          data={animals}
          renderItem={renderAnimalCard}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.animalsList}
          numColumns={1}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="paw-outline" size={64} color={COLORS.gray} />
              <Text style={styles.emptyText}>لا توجد نتائج للبحث</Text>
              <Text style={styles.emptySubtext}>
                جرب تغيير معايير البحث أو الفلاتر
              </Text>
              <Button
                title="مسح الفلاتر"
                style={styles.clearFiltersButton}
                onPress={clearFilters}
              />
            </View>
          )}
        />
      )}

      <FilterModal />
      <SortModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: SIZES.padding,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
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
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    position: 'relative',
  },
  activeActionButton: {
    backgroundColor: COLORS.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  activeFilters: {
    flexDirection: 'row',
    flex: 1,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  activeFilterText: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginRight: 4,
  },
  clearAllFilters: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearAllFiltersText: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.medium,
    color: COLORS.error,
  },
  animalsList: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.semiBold,
    color: COLORS.gray,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 24,
  },
  clearFiltersButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  filterContent: {
    padding: SIZES.padding,
    maxHeight: 400,
  },
  filterGroup: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
    marginBottom: 12,
  },
  categoryButtons: {
    flexDirection: 'row',
    paddingRight: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  selectedCategory: {
    backgroundColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  selectedCategoryText: {
    color: COLORS.white,
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
  },
  priceSeparator: {
    marginHorizontal: 12,
    fontSize: SIZES.body1,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedStatus: {
    backgroundColor: COLORS.primary,
  },
  statusButtonText: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  selectedStatusText: {
    color: COLORS.white,
  },
  modalActions: {
    flexDirection: 'row',
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  clearButton: {
    backgroundColor: COLORS.lightGray,
  },
  clearButtonText: {
    color: COLORS.gray,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
  },
  fullWidthButton: {
    flex: 1,
  },
  // Sort Modal
  sortContent: {
    padding: SIZES.padding,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: COLORS.lightGray,
  },
  selectedSortOption: {
    backgroundColor: COLORS.primary + '20',
  },
  sortOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortOptionText: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.medium,
    color: COLORS.black,
    marginLeft: 12,
  },
  selectedSortOptionText: {
    color: COLORS.primary,
  },
});

export default AuctionsScreen;

