import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';
const { COLORS, SIZES, SHADOWS } = theme;
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

const PaymentMethodsScreen = ({ navigation }) => {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      type: 'visa',
      lastFour: '4532',
      expiryDate: '12/25',
      isDefault: true,
      holderName: 'John Doe',
    },
    {
      id: '2',
      type: 'mastercard',
      lastFour: '8901',
      expiryDate: '08/26',
      isDefault: false,
      holderName: 'John Doe',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    holderName: '',
  });

  const getCardIcon = (type) => {
    switch (type) {
      case 'visa':
        return 'card';
      case 'mastercard':
        return 'card';
      case 'amex':
        return 'card';
      default:
        return 'card-outline';
    }
  };

  const getCardColor = (type) => {
    switch (type) {
      case 'visa':
        return '#1A1F71';
      case 'mastercard':
        return '#EB001B';
      case 'amex':
        return '#006FCF';
      default:
        return COLORS.primary;
    }
  };

  const handleSetDefault = (cardId) => {
    setPaymentMethods(prev =>
      prev.map(card => ({
        ...card,
        isDefault: card.id === cardId,
      }))
    );
    Alert.alert('تم التحديث', 'تم تعيين البطاقة كافتراضية بنجاح');
  };

  const handleDeleteCard = (cardId) => {
    Alert.alert(
      'حذف البطاقة',
      'هل أنت متأكد من حذف هذه البطاقة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(prev => prev.filter(card => card.id !== cardId));
          },
        },
      ]
    );
  };

  const handleAddCard = () => {
    if (!newCard.cardNumber || !newCard.expiryDate || !newCard.cvv || !newCard.holderName) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
      return;
    }

    const cardType = newCard.cardNumber.startsWith('4') ? 'visa' : 'mastercard';
    const newCardData = {
      id: Date.now().toString(),
      type: cardType,
      lastFour: newCard.cardNumber.slice(-4),
      expiryDate: newCard.expiryDate,
      isDefault: paymentMethods.length === 0,
      holderName: newCard.holderName,
    };

    setPaymentMethods(prev => [...prev, newCardData]);
    setNewCard({ cardNumber: '', expiryDate: '', cvv: '', holderName: '' });
    setShowAddModal(false);
    Alert.alert('تم الإضافة', 'تم إضافة البطاقة بنجاح');
  };

  const renderPaymentMethod = ({ item }) => (
    <View style={styles.cardContainer}>
      <View style={[styles.card, { backgroundColor: getCardColor(item.type) }]}>
        <View style={styles.cardHeader}>
          <Ionicons name={getCardIcon(item.type)} size={32} color={COLORS.white} />
          <Text style={styles.cardType}>{item.type.toUpperCase()}</Text>
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>افتراضي</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.cardNumber}>•••• •••• •••• {item.lastFour}</Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.holderName}>{item.holderName}</Text>
          <Text style={styles.expiryDate}>{item.expiryDate}</Text>
        </View>
      </View>
      
      <View style={styles.cardActions}>
        {!item.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(item.id)}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>تعيين كافتراضي</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteCard(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          <Text style={[styles.actionText, styles.deleteText]}>حذف</Text>
        </TouchableOpacity>
      </View>
    </View>
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
        <Text style={styles.headerTitle}>طرق الدفع</Text>
        <Text style={styles.headerTitleEn}>Payment Methods</Text>
      </View>

      {/* Payment Methods List */}
      <FlatList
        data={paymentMethods}
        renderItem={renderPaymentMethod}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>لا توجد بطاقات دفع</Text>
            <Text style={styles.emptySubtext}>أضف بطاقة دفع للبدء في المزايدة</Text>
          </View>
        }
      />

      {/* Add Card Button */}
      <View style={styles.addButtonContainer}>
        <Button
          title="إضافة بطاقة جديدة"
          onPress={() => setShowAddModal(true)}
          style={styles.addButton}
        />
      </View>

      {/* Add Card Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelText}>إلغاء</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>إضافة بطاقة جديدة</Text>
            <TouchableOpacity onPress={handleAddCard}>
              <Text style={styles.saveText}>حفظ</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>رقم البطاقة</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                value={newCard.cardNumber}
                onChangeText={(text) => setNewCard(prev => ({ ...prev, cardNumber: text }))}
                keyboardType="numeric"
                maxLength={19}
              />
            </View>
            
            <View style={styles.rowContainer}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>تاريخ الانتهاء</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  value={newCard.expiryDate}
                  onChangeText={(text) => setNewCard(prev => ({ ...prev, expiryDate: text }))}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  value={newCard.cvv}
                  onChangeText={(text) => setNewCard(prev => ({ ...prev, cvv: text }))}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>اسم حامل البطاقة</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={newCard.holderName}
                onChangeText={(text) => setNewCard(prev => ({ ...prev, holderName: text }))}
                autoCapitalize="words"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

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
  listContainer: {
    padding: SIZES.padding,
    paddingBottom: 100,
  },
  cardContainer: {
    marginBottom: SIZES.padding,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    ...SHADOWS.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardType: {
    color: COLORS.white,
    fontSize: SIZES.body1,
    fontWeight: 'bold',
  },
  defaultBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: COLORS.white,
    fontSize: SIZES.body3,
    fontWeight: '500',
  },
  cardNumber: {
    color: COLORS.white,
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  holderName: {
    color: COLORS.white,
    fontSize: SIZES.body2,
    fontWeight: '500',
  },
  expiryDate: {
    color: COLORS.white,
    fontSize: SIZES.body2,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  actionText: {
    marginLeft: 8,
    fontSize: SIZES.body3,
    color: COLORS.primary,
    fontWeight: '500',
  },
  deleteText: {
    color: COLORS.error,
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
  addButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: SIZES.padding,
    right: SIZES.padding,
  },
  addButton: {
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  modalTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cancelText: {
    fontSize: SIZES.body1,
    color: COLORS.textSecondary,
  },
  saveText: {
    fontSize: SIZES.body1,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: SIZES.padding,
  },
  inputContainer: {
    marginBottom: SIZES.padding,
  },
  inputLabel: {
    fontSize: SIZES.body2,
    color: COLORS.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: SIZES.body1,
    backgroundColor: COLORS.white,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
});

export default PaymentMethodsScreen;