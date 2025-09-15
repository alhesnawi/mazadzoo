import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';
const { COLORS, SIZES, SHADOWS } = theme;
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

const SupportScreen = ({ navigation }) => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);

  const faqData = [
    {
      id: '1',
      question: 'كيف يمكنني المشاركة في المزايدة؟',
      answer: 'للمشاركة في المزايدة، يجب أولاً إنشاء حساب والتحقق من هويتك. بعد ذلك، يمكنك تصفح المزايدات المتاحة والمشاركة بوضع عروضك.',
    },
    {
      id: '2',
      question: 'ما هي طرق الدفع المقبولة؟',
      answer: 'نقبل جميع البطاقات الائتمانية الرئيسية (Visa, Mastercard, American Express) والتحويلات البنكية. جميع المدفوعات آمنة ومشفرة.',
    },
    {
      id: '3',
      question: 'كيف يتم تسليم الحيوانات؟',
      answer: 'نوفر خدمة التسليم الآمن للحيوانات النادرة مع جميع الوثائق والشهادات المطلوبة. يتم التنسيق مع الفائز لترتيب عملية التسليم.',
    },
    {
      id: '4',
      question: 'هل يمكنني إلغاء مزايدتي؟',
      answer: 'لا يمكن إلغاء المزايدات بعد تقديمها. يرجى التأكد من رغبتك في المزايدة قبل تأكيد العرض.',
    },
    {
      id: '5',
      question: 'ماذا يحدث إذا لم أدفع بعد الفوز؟',
      answer: 'في حالة عدم الدفع خلال المدة المحددة، سيتم إلغاء الصفقة وقد يتم تعليق حسابك. كما قد تطبق رسوم إضافية.',
    },
    {
      id: '6',
      question: 'كيف يمكنني التحقق من صحة الحيوان؟',
      answer: 'جميع الحيوانات المعروضة معتمدة من خبراء متخصصين ولديها شهادات صحية وجينية. يمكنك طلب تقرير مفصل قبل المزايدة.',
    },
  ];

  const contactOptions = [
    {
      id: '1',
      title: 'الدردشة المباشرة',
      subtitle: 'متاح 24/7',
      icon: 'chatbubble-ellipses',
      color: COLORS.primary,
      action: () => Alert.alert('قريباً', 'خدمة الدردشة المباشرة ستكون متاحة قريباً'),
    },
    {
      id: '2',
      title: 'البريد الإلكتروني',
      subtitle: 'support@rareanimals.com',
      icon: 'mail',
      color: COLORS.secondary,
      action: () => setShowContactModal(true),
    },
    {
      id: '3',
      title: 'الهاتف',
      subtitle: '+966 11 123 4567',
      icon: 'call',
      color: COLORS.success,
      action: () => Linking.openURL('tel:+966111234567'),
    },
    {
      id: '4',
      title: 'واتساب',
      subtitle: 'دعم سريع',
      icon: 'logo-whatsapp',
      color: '#25D366',
      action: () => Linking.openURL('https://wa.me/966111234567'),
    },
  ];

  const handleFAQPress = (faqId) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const handleSendMessage = async () => {
    if (!contactForm.subject || !contactForm.message || !contactForm.email) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'تم الإرسال',
        'تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.',
        [{ text: 'موافق', onPress: () => setShowContactModal(false) }]
      );
      
      setContactForm({ subject: '', message: '', email: '' });
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const renderFAQItem = ({ item }) => (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => handleFAQPress(item.id)}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <Ionicons
          name={expandedFAQ === item.id ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={COLORS.textSecondary}
        />
      </View>
      {expandedFAQ === item.id && (
        <Text style={styles.faqAnswer}>{item.answer}</Text>
      )}
    </TouchableOpacity>
  );

  const renderContactOption = (option) => (
    <TouchableOpacity
      key={option.id}
      style={styles.contactOption}
      onPress={option.action}
    >
      <View style={[styles.contactIcon, { backgroundColor: option.color + '20' }]}>
        <Ionicons name={option.icon} size={24} color={option.color} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>{option.title}</Text>
        <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
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
        <Text style={styles.headerTitle}>المساعدة والدعم</Text>
        <Text style={styles.headerTitleEn}>Help & Support</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>كيف يمكننا مساعدتك؟</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction}>
              <Ionicons name="document-text" size={32} color={COLORS.primary} />
              <Text style={styles.quickActionText}>دليل المستخدم</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <Ionicons name="shield-checkmark" size={32} color={COLORS.success} />
              <Text style={styles.quickActionText}>الأمان</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <Ionicons name="card" size={32} color={COLORS.warning} />
              <Text style={styles.quickActionText}>المدفوعات</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تواصل معنا</Text>
          <View style={styles.contactOptions}>
            {contactOptions.map(renderContactOption)}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الأسئلة الشائعة</Text>
          <View style={styles.faqContainer}>
            {faqData.map((item) => renderFAQItem({ item }))}
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.emergencySection}>
          <View style={styles.emergencyHeader}>
            <Ionicons name="warning" size={24} color={COLORS.error} />
            <Text style={styles.emergencyTitle}>حالة طوارئ؟</Text>
          </View>
          <Text style={styles.emergencyText}>
            في حالة وجود مشكلة عاجلة تتعلق بصحة الحيوان أو حالة طوارئ، يرجى الاتصال فوراً:
          </Text>
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={() => Linking.openURL('tel:+966111234567')}
          >
            <Ionicons name="call" size={20} color={COLORS.white} />
            <Text style={styles.emergencyButtonText}>اتصال طوارئ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Contact Modal */}
      <Modal
        visible={showContactModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowContactModal(false)}>
              <Text style={styles.cancelText}>إلغاء</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>إرسال رسالة</Text>
            <TouchableOpacity onPress={handleSendMessage}>
              <Text style={styles.sendText}>إرسال</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>البريد الإلكتروني</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                value={contactForm.email}
                onChangeText={(text) => setContactForm(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>الموضوع</Text>
              <TextInput
                style={styles.input}
                placeholder="موضوع الرسالة"
                value={contactForm.subject}
                onChangeText={(text) => setContactForm(prev => ({ ...prev, subject: text }))}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>الرسالة</Text>
              <TextInput
                style={[styles.input, styles.messageInput]}
                placeholder="اكتب رسالتك هنا..."
                value={contactForm.message}
                onChangeText={(text) => setContactForm(prev => ({ ...prev, message: text }))}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
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
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    ...SHADOWS.light,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionText: {
    fontSize: SIZES.body3,
    color: COLORS.text,
    marginTop: 8,
    textAlign: 'center',
  },
  contactOptions: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    ...SHADOWS.light,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: SIZES.body1,
    fontWeight: '600',
    color: COLORS.text,
  },
  contactSubtitle: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  faqContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    ...SHADOWS.light,
  },
  faqItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: SIZES.body1,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    marginTop: 12,
    lineHeight: 20,
  },
  emergencySection: {
    backgroundColor: COLORS.error + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emergencyTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.error,
    marginLeft: 8,
  },
  emergencyText: {
    fontSize: SIZES.body2,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  emergencyButton: {
    backgroundColor: COLORS.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  emergencyButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body1,
    fontWeight: 'bold',
    marginLeft: 8,
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
  sendText: {
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
  messageInput: {
    height: 120,
  },
});

export default SupportScreen;