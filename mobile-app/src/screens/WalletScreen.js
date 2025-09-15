import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  FlatList,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

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

export default function WalletScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const [balance, setBalance] = useState(2500.00);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadTransactions();
    }
  }, [isAuthenticated]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      // Simulated API call - replace with actual API
      const mockTransactions = [
        {
          _id: '1',
          type: 'bid_payment',
          amount: -1500,
          description: 'دفع مزايدة - نمر سيبيري',
          descriptionEn: 'Bid Payment - Siberian Tiger',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          status: 'completed',
        },
        {
          _id: '2',
          type: 'top_up',
          amount: 2000,
          description: 'شحن المحفظة',
          descriptionEn: 'Wallet Top-up',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: 'completed',
        },
        {
          _id: '3',
          type: 'promo_bonus',
          amount: 500,
          description: 'مكافأة كود الخصم - WELCOME50',
          descriptionEn: 'Promo Code Bonus - WELCOME50',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          status: 'completed',
        },
        {
          _id: '4',
          type: 'refund',
          amount: 800,
          description: 'استرداد مزايدة ملغية',
          descriptionEn: 'Cancelled Bid Refund',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          status: 'completed',
        },
        {
          _id: '5',
          type: 'bid_payment',
          amount: -300,
          description: 'دفع مزايدة - ببغاء أزرق',
          descriptionEn: 'Bid Payment - Blue Parrot',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          status: 'completed',
        },
      ];
      
      setTransactions(mockTransactions);
    } catch (error) {
      // Handle transaction loading error
      Alert.alert('خطأ', 'فشل في تحميل المعاملات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      Alert.alert('خطأ', 'يرجى إدخال مبلغ صحيح');
      return;
    }

    try {
      setLoading(true);
      // Simulated API call for top-up
      const amount = parseFloat(topUpAmount);
      
      // Add new transaction
      const newTransaction = {
        _id: Date.now().toString(),
        type: 'top_up',
        amount: amount,
        description: 'شحن المحفظة',
        descriptionEn: 'Wallet Top-up',
        date: new Date(),
        status: 'completed',
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      setBalance(prev => prev + amount);
      setTopUpAmount('');
      setShowTopUpModal(false);
      
      Alert.alert('نجح', `تم شحن المحفظة بمبلغ ${amount} ريال بنجاح`);
    } catch (error) {
      Alert.alert('خطأ', 'فشل في شحن المحفظة');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoCode = async () => {
    if (!promoCode.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال كود الخصم');
      return;
    }

    try {
      setPromoLoading(true);
      
      // Simulated promo code validation
      const validPromoCodes = {
        'WELCOME50': { bonus: 50, description: 'مكافأة ترحيب' },
        'SAVE100': { bonus: 100, description: 'خصم خاص' },
        'BONUS200': { bonus: 200, description: 'مكافأة كبيرة' },
        'NEWUSER': { bonus: 75, description: 'مكافأة مستخدم جديد' },
      };
      
      const promoData = validPromoCodes[promoCode.toUpperCase()];
      
      if (!promoData) {
        Alert.alert('خطأ', 'كود الخصم غير صحيح أو منتهي الصلاحية');
        return;
      }
      
      // Check if promo code was already used
      const alreadyUsed = transactions.some(t => 
        t.description.includes(promoCode.toUpperCase())
      );
      
      if (alreadyUsed) {
        Alert.alert('خطأ', 'تم استخدام هذا الكود من قبل');
        return;
      }
      
      // Add promo bonus transaction
      const newTransaction = {
        _id: Date.now().toString(),
        type: 'promo_bonus',
        amount: promoData.bonus,
        description: `مكافأة كود الخصم - ${promoCode.toUpperCase()}`,
        descriptionEn: `Promo Code Bonus - ${promoCode.toUpperCase()}`,
        date: new Date(),
        status: 'completed',
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      setBalance(prev => prev + promoData.bonus);
      setPromoCode('');
      setShowPromoModal(false);
      
      Alert.alert(
        'تم بنجاح!',
        `تم إضافة ${promoData.bonus} ريال إلى محفظتك من ${promoData.description}`
      );
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تطبيق كود الخصم');
    } finally {
      setPromoLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'bid_payment': return 'hammer-outline';
      case 'top_up': return 'add-circle-outline';
      case 'promo_bonus': return 'gift-outline';
      case 'refund': return 'return-up-back-outline';
      default: return 'swap-horizontal-outline';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'bid_payment': return COLORS.error;
      case 'top_up': return COLORS.success;
      case 'promo_bonus': return COLORS.warning;
      case 'refund': return COLORS.info;
      default: return COLORS.gray;
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionCard}>
      <View style={[styles.transactionIcon, { backgroundColor: getTransactionColor(item.type) }]}>
        <Ionicons 
          name={getTransactionIcon(item.type)} 
          size={20} 
          color={COLORS.white} 
        />
      </View>
      
      <View style={styles.transactionContent}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDescriptionEn}>{item.descriptionEn}</Text>
        <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
      </View>
      
      <View style={styles.transactionAmount}>
        <Text style={[
          styles.amountText,
          { color: item.amount > 0 ? COLORS.success : COLORS.error }
        ]}>
          {item.amount > 0 ? '+' : ''}{item.amount} ريال
        </Text>
      </View>
    </View>
  );

  const quickTopUpAmounts = [100, 250, 500, 1000, 2000, 5000];

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
          <Text style={styles.headerTitle}>المحفظة</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.loginPrompt}>
          <Ionicons name="wallet-outline" size={64} color={COLORS.gray} />
          <Text style={styles.loginTitle}>تسجيل الدخول مطلوب</Text>
          <Text style={styles.loginSubtitle}>
            يجب تسجيل الدخول للوصول إلى المحفظة
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
        <Text style={styles.headerTitle}>المحفظة</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => {/* Handle wallet settings */}}
        >
          <Ionicons name="settings-outline" size={24} color={COLORS.gray} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>الرصيد الحالي</Text>
            <Text style={styles.balanceLabelEn}>Current Balance</Text>
          </View>
          <Text style={styles.balanceAmount}>{balance.toFixed(2)} ريال</Text>
          
          <View style={styles.balanceActions}>
            <TouchableOpacity 
              style={styles.balanceButton}
              onPress={() => setShowTopUpModal(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
              <Text style={styles.balanceButtonText}>شحن</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.balanceButton, styles.promoButton]}
              onPress={() => setShowPromoModal(true)}
            >
              <Ionicons name="gift-outline" size={20} color={COLORS.white} />
              <Text style={styles.balanceButtonText}>كود خصم</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="trending-up-outline" size={24} color={COLORS.success} />
            <Text style={styles.statValue}>+{transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)} ريال</Text>
            <Text style={styles.statLabel}>إجمالي الإيداعات</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="trending-down-outline" size={24} color={COLORS.error} />
            <Text style={styles.statValue}>{transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)} ريال</Text>
            <Text style={styles.statLabel}>إجمالي المصروفات</Text>
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>المعاملات الأخيرة</Text>
          <Text style={styles.sectionTitleEn}>Recent Transactions</Text>
          
          {transactions.length === 0 ? (
            <View style={styles.emptyTransactions}>
              <Ionicons name="receipt-outline" size={48} color={COLORS.gray} />
              <Text style={styles.emptyText}>لا توجد معاملات</Text>
            </View>
          ) : (
            <FlatList
              data={transactions}
              renderItem={renderTransaction}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Top-up Modal */}
      <Modal
        visible={showTopUpModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTopUpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>شحن المحفظة</Text>
              <TouchableOpacity onPress={() => setShowTopUpModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>اختر المبلغ أو أدخل مبلغ مخصص</Text>
            
            {/* Quick amounts */}
            <View style={styles.quickAmounts}>
              {quickTopUpAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.quickAmountButton,
                    topUpAmount === amount.toString() && styles.selectedAmount
                  ]}
                  onPress={() => setTopUpAmount(amount.toString())}
                >
                  <Text style={[
                    styles.quickAmountText,
                    topUpAmount === amount.toString() && styles.selectedAmountText
                  ]}>
                    {amount} ريال
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Custom amount */}
            <View style={styles.customAmountSection}>
              <Text style={styles.inputLabel}>مبلغ مخصص</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="أدخل المبلغ"
                value={topUpAmount}
                onChangeText={setTopUpAmount}
                keyboardType="numeric"
                textAlign="center"
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.confirmButton, loading && styles.disabledButton]}
              onPress={handleTopUp}
              disabled={loading}
            >
              <Text style={styles.confirmButtonText}>
                {loading ? 'جاري الشحن...' : 'تأكيد الشحن'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Promo Code Modal */}
      <Modal
        visible={showPromoModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPromoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>كود الخصم</Text>
              <TouchableOpacity onPress={() => setShowPromoModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>أدخل كود الخصم للحصول على مكافأة</Text>
            
            {/* Available promo codes hint */}
            <View style={styles.promoHint}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.info} />
              <Text style={styles.promoHintText}>
                جرب: WELCOME50, SAVE100, BONUS200, NEWUSER
              </Text>
            </View>
            
            <View style={styles.promoInputSection}>
              <Text style={styles.inputLabel}>كود الخصم</Text>
              <TextInput
                style={styles.promoInput}
                placeholder="أدخل كود الخصم"
                value={promoCode}
                onChangeText={setPromoCode}
                autoCapitalize="characters"
                textAlign="center"
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.confirmButton, promoLoading && styles.disabledButton]}
              onPress={handlePromoCode}
              disabled={promoLoading}
            >
              <Text style={styles.confirmButtonText}>
                {promoLoading ? 'جاري التحقق...' : 'تطبيق الكود'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  settingsButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    margin: 20,
    padding: 25,
    borderRadius: 16,
    alignItems: 'center',
  },
  balanceHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  balanceLabel: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
  },
  balanceLabelEn: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.7,
    marginTop: 2,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 20,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: 15,
  },
  balanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  promoButton: {
    backgroundColor: COLORS.warning,
  },
  balanceButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
  },
  transactionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  sectionTitleEn: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 15,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  transactionContent: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  transactionDescriptionEn: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.gray,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalSubtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  quickAmountButton: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
  },
  selectedAmount: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quickAmountText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  selectedAmountText: {
    color: COLORS.white,
  },
  customAmountSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  amountInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
  promoHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  promoHintText: {
    fontSize: 12,
    color: COLORS.info,
    marginLeft: 8,
    flex: 1,
  },
  promoInputSection: {
    marginBottom: 20,
  },
  promoInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  confirmButtonText: {
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