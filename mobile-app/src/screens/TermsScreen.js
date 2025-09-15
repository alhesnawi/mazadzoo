import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import theme from '../constants/theme';
const { COLORS, SIZES, SHADOWS } = theme;

export default function TermsScreen({ navigation }) {
  const termsData = [
    {
      title: 'شروط الاستخدام العامة',
      titleEn: 'General Terms of Use',
      content: 'بقبولك لهذه الشروط، فإنك توافق على الالتزام بجميع القوانين واللوائح المعمول بها في منصة مزاد الحيوانات النادرة.',
      contentEn: 'By accepting these terms, you agree to comply with all applicable laws and regulations on the Rare Animals Auction platform.'
    },
    {
      title: 'قواعد المزايدة',
      titleEn: 'Bidding Rules',
      content: 'جميع المزايدات نهائية وملزمة. لا يمكن إلغاء المزايدة بعد تقديمها. يجب على الفائز في المزاد إتمام عملية الدفع خلال 48 ساعة.',
      contentEn: 'All bids are final and binding. Bids cannot be cancelled once submitted. Auction winners must complete payment within 48 hours.'
    },
    {
      title: 'التراخيص والشهادات',
      titleEn: 'Licenses and Certificates',
      content: 'جميع الحيوانات المعروضة تحمل التراخيص والشهادات الصحية المطلوبة. المشتري مسؤول عن الحصول على أي تراخيص إضافية مطلوبة.',
      contentEn: 'All animals listed carry required licenses and health certificates. Buyers are responsible for obtaining any additional required permits.'
    },
    {
      title: 'سياسة الاسترداد',
      titleEn: 'Refund Policy',
      content: 'لا توجد عمليات استرداد للمزايدات المكتملة إلا في حالات استثنائية يحددها فريق الإدارة.',
      contentEn: 'No refunds for completed auctions except in exceptional cases determined by the management team.'
    },
    {
      title: 'المسؤولية القانونية',
      titleEn: 'Legal Responsibility',
      content: 'المنصة غير مسؤولة عن أي أضرار أو خسائر قد تنتج عن استخدام الخدمة. المستخدم يتحمل المسؤولية الكاملة.',
      contentEn: 'The platform is not responsible for any damages or losses that may result from using the service. Users bear full responsibility.'
    },
    {
      title: 'حماية البيانات',
      titleEn: 'Data Protection',
      content: 'نحن ملتزمون بحماية بياناتك الشخصية وفقاً لسياسة الخصوصية المعتمدة.',
      contentEn: 'We are committed to protecting your personal data in accordance with our approved privacy policy.'
    },
    {
      title: 'تعديل الشروط',
      titleEn: 'Terms Modification',
      content: 'نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إشعار المستخدمين بأي تغييرات جوهرية.',
      contentEn: 'We reserve the right to modify these terms at any time. Users will be notified of any material changes.'
    }
  ];

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
        <Text style={styles.headerTitle}>الشروط والأحكام</Text>
        <Text style={styles.headerTitleEn}>Terms & Conditions</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>مرحباً بك في منصة مزاد الحيوانات النادرة</Text>
          <Text style={styles.introTitleEn}>Welcome to Rare Animals Auction Platform</Text>
          <Text style={styles.introText}>
            يرجى قراءة هذه الشروط والأحكام بعناية قبل استخدام خدماتنا. استخدامك للمنصة يعني موافقتك على هذه الشروط.
          </Text>
          <Text style={styles.introTextEn}>
            Please read these terms and conditions carefully before using our services. Your use of the platform constitutes acceptance of these terms.
          </Text>
        </View>

        {/* Terms Sections */}
        {termsData.map((term, index) => (
          <View key={index} style={styles.termSection}>
            <Text style={styles.termTitle}>{term.title}</Text>
            <Text style={styles.termTitleEn}>{term.titleEn}</Text>
            <Text style={styles.termContent}>{term.content}</Text>
            <Text style={styles.termContentEn}>{term.contentEn}</Text>
          </View>
        ))}

        {/* Contact Information */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>للاستفسارات والدعم</Text>
          <Text style={styles.contactTitleEn}>For Inquiries and Support</Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>support@rareanimals.com</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>+966 50 123 4567</Text>
            </View>
          </View>
        </View>

        {/* Last Updated */}
        <View style={styles.updateSection}>
          <Text style={styles.updateText}>آخر تحديث: ديسمبر 2024</Text>
          <Text style={styles.updateTextEn}>Last Updated: December 2024</Text>
        </View>
      </ScrollView>
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
    textAlign: 'center',
  },
  headerTitleEn: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  introSection: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 5,
  },
  introTitleEn: {
    fontSize: 16,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: 15,
  },
  introText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    textAlign: 'right',
    marginBottom: 10,
  },
  introTextEn: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
    textAlign: 'left',
  },
  termSection: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  termTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
    textAlign: 'right',
  },
  termTitleEn: {
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 10,
    textAlign: 'left',
  },
  termContent: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    textAlign: 'right',
    marginBottom: 10,
  },
  termContentEn: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
    textAlign: 'left',
  },
  contactSection: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 5,
  },
  contactTitleEn: {
    fontSize: 14,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: 15,
  },
  contactInfo: {
    alignItems: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 10,
  },
  updateSection: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 20,
  },
  updateText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 5,
  },
  updateTextEn: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
  },
});