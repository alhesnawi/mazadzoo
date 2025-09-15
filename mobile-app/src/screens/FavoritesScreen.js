import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
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

const FavoritesScreen = ({ navigation }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const { 
    favorites, 
    loading, 
    loadFavorites, 
    unfavoriteAnimal 
  } = useContext(AuctionContext);

  const [refreshing, setRefreshing] = useState(false);
  const [localFavorites, setLocalFavorites] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setLocalFavorites(favorites || []);
  }, [favorites]);

  const fetchFavorites = async () => {
    try {
      await loadFavorites();
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تحميل المفضلة');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFavorites();
    setRefreshing(false);
  };

  const handleUnfavorite = async (animalId) => {
    Alert.alert(
      'إزالة من المفضلة',
      'هل تريد إزالة هذا الحيوان من المفضلة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'إزالة',
          style: 'destructive',
          onPress: async () => {
            try {
              await unfavoriteAnimal(animalId);
              setLocalFavorites(prev => prev.filter(animal => animal._id !== animalId));
            } catch (error) {
              Alert.alert('خطأ', 'فشل في إزالة الحيوان من المفضلة');
            }
          },
        },
      ]
    );
  };

  const renderFavoriteAnimal = ({ item }) => (
    <AnimalCard
      animal={item}
      onPress={() => navigation.navigate('AnimalDetail', { animalId: item._id })}
      onFavorite={() => handleUnfavorite(item._id)}
      showFavorite={true}
      style={styles.animalCard}
    />
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color={COLORS.gray} />
      <Text style={styles.emptyTitle}>لا توجد مفضلة</Text>
      <Text style={styles.emptySubtitle}>
        لم تقم بإضافة أي حيوانات إلى المفضلة بعد
      </Text>
      <Button
        title="تصفح المزادات"
        style={styles.browseButton}
        onPress={() => navigation.navigate('Auctions')}
      />
    </View>
  );

  const LoginPrompt = () => (
    <View style={styles.loginContainer}>
      <Ionicons name="person-outline" size={80} color={COLORS.gray} />
      <Text style={styles.loginTitle}>تسجيل الدخول مطلوب</Text>
      <Text style={styles.loginSubtitle}>
        يجب تسجيل الدخول لعرض المفضلة
      </Text>
      <Button
        title="تسجيل الدخول"
        style={styles.loginButton}
        onPress={() => navigation.navigate('Login')}
      />
    </View>
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
          <Text style={styles.headerTitle}>المفضلة</Text>
          <View style={styles.placeholder} />
        </View>
        <LoginPrompt />
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
        <Text style={styles.headerTitle}>المفضلة</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            if (localFavorites.length > 0) {
              Alert.alert(
                'مسح المفضلة',
                'هل تريد مسح جميع الحيوانات من المفضلة؟',
                [
                  { text: 'إلغاء', style: 'cancel' },
                  {
                    text: 'مسح الكل',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        // Clear all favorites
                        for (const animal of localFavorites) {
                          await unfavoriteAnimal(animal._id);
                        }
                        setLocalFavorites([]);
                      } catch (error) {
                        Alert.alert('خطأ', 'فشل في مسح المفضلة');
                      }
                    },
                  },
                ]
              );
            }
          }}
        >
          <Ionicons 
            name="trash-outline" 
            size={24} 
            color={localFavorites.length > 0 ? COLORS.error : COLORS.gray} 
          />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{localFavorites.length}</Text>
          <Text style={styles.statLabel}>حيوان مفضل</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {localFavorites.filter(animal => animal.status === 'active').length}
          </Text>
          <Text style={styles.statLabel}>مزاد نشط</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {localFavorites.filter(animal => animal.status === 'completed').length}
          </Text>
          <Text style={styles.statLabel}>مزاد منتهي</Text>
        </View>
      </View>

      {/* Favorites List */}
      {localFavorites.length > 0 ? (
        <FlatList
          data={localFavorites}
          renderItem={renderFavoriteAnimal}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState />
      )}

      {loading && <Loading visible text="جاري تحميل المفضلة..." />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    ...SHADOWS.light,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  listContainer: {
    padding: SIZES.padding,
  },
  animalCard: {
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  emptyTitle: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  browseButton: {
    paddingHorizontal: 32,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  loginTitle: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginTop: 24,
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  loginButton: {
    paddingHorizontal: 32,
  },
});

export default FavoritesScreen;