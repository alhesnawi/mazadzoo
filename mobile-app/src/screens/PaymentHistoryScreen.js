import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';
const { COLORS, SIZES, SHADOWS } = theme;
import LoadingSpinner from '../components/LoadingSpinner';

const PaymentHistoryScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([
    {
      id: '1',
      type: 'payment',
      amount: 1500,
      currency: 'USD',
      status: 'completed',
      date: '2024-01-15T10:30:00Z',
      description: 'مزايدة على الأسد الأبيض النادر',
      auctionId: 'auction_001',
      paymentMethod: 'Visa ****4532',
      transactionId: 'TXN_001234567',
    },
    {
      id: '2',
      type: 'refund',
      amount: 800,
      currency: 'USD',
      status: 'completed',
      date: '2024-01-12T14:20:00Z',
      description: 'استرداد مزايدة النمر السيبيري',
      auctionId: 'auction_002',
      paymentMethod: 'Mastercard ****8901',
      transactionId: 'TXN_001234566',
    },
    {
      id: '3',
      type: 'payment',
      amount: 2200,
      currency: 'USD',
      status: 'pending',
      date: '2024-01-10T09:15:00Z',
      description: 'مزايدة على الفهد الثلجي',
      auctionId: 'auction_003',
      paymentMethod: 'Visa ****4532',
      transactionId: 'TXN_001234565',
    },
    {
      id: '4',
      type: 'payment',
      amount: 950,
      currency: 'USD',
      status: 'failed',
      date: '2024-01-08T16:45:00Z',
      description: 'مزايدة على الباندا العملاقة',
      auctionId: 'auction_004',
      paymentMethod: 'Visa ****4532',
      transactionId: 'TXN_001234564',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, payment, refund

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'failed':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'pending':
        return 'قيد المعالجة';
      case 'failed':
        return 'فشل';
      default:
        return status;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'payment':
        return 'arrow-up-circle';
      case 'refund':
        return 'arrow-down-circle';
      default:
        return 'swap-horizontal';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'payment':
        return COLORS.error;
      case 'refund':
        return COLORS.success;
      default:
        return COLORS.primary;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount, currency, type) => {
    const sign = type === 'refund' ? '+' : '-';
    return `${sign}$${amount.toLocaleString()}`;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleTransactionPress = (transaction) => {
    Alert.alert(
      'تفاصيل المعاملة',
      `رقم المعاملة: ${transaction.transactionId}\nالتاريخ: ${formatDate(transaction.date)}\nطريقة الدفع: ${transaction.paymentMethod}\nالحالة: ${getStatusText(transaction.status)}`,
      [{ text: 'موافق' }]
    );
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  const renderTransaction = ({ item }) => (
    <TouchableOpacity
      style={styles.transactionCard}
      onPress={() => handleTransactionPress(item)}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <View style={[styles.typeIcon, { backgroundColor: getTypeColor(item.type) + '20' }]}>
            <Ionicons
              name={getTypeIcon(item.type)}
              size={24}
              color={getTypeColor(item.type)}
            />
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
            <Text style={styles.paymentMethod}>{item.paymentMethod}</Text>
          </View>
        </View>
        <View style={styles.transactionAmount}>
          <Text style={[styles.amount, { color: getTypeColor(item.type) }]}>
            {formatAmount(item.amount, item.currency, item.type)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (filterType, title) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === filterType && styles.activeFilterButton,
      ]}
      onPress={() => setFilter(filterType)}
    >
      <Text
        style={[
          styles.filterText,
          filter === filterType && styles.activeFilterText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>سجل المدفوعات</Text>
        <Text style={styles.headerTitleEn}>Payment History</Text>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'الكل')}
        {renderFilterButton('payment', 'المدفوعات')}
        {renderFilterButton('refund', 'المستردات')}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>إجمالي المدفوعات</Text>
          <Text style={styles.summaryAmount}>$4,650</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>إجمالي المستردات</Text>
          <Text style={[styles.summaryAmount, { color: COLORS.success }]}>$800</Text>
        </View>
      </View>

      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>لا توجد معاملات</Text>
            <Text style={styles.emptySubtext}>ستظهر معاملاتك هنا</Text>
          </View>
        }
      />

      {loading && <LoadingSpinner />}
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
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    flex: 1,
  },
  headerTitleEn: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    position: 'absolute',
    bottom: 5,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeFilterText: {
    color: COLORS.white,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    ...SHADOWS.light,
  },
  summaryLabel: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  listContainer: {
    padding: SIZES.padding,
    paddingTop: 0,
  },
  transactionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.light,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transactionInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: SIZES.body1,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  paymentMethod: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: SIZES.body3,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: SIZES.h3,
    color: COLORS.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default PaymentHistoryScreen;