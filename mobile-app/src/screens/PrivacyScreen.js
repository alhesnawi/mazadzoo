import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';
const { COLORS, SIZES, SHADOWS } = theme;

const PrivacyScreen = ({ navigation }) => {
  const [privacySettings, setPrivacySettings] = useState({
    dataCollection: true,
    analytics: true,
    marketing: false,
    locationTracking: false,
    notifications: true,
    profileVisibility: true,
    bidHistory: false,
  });

  const lastUpdated = '2024-01-15';

  const handleSettingChange = (setting, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value,
    }));
  };

  const privacySections = [
    {
      id: '1',
      title: 'جمع البيانات',
      content: `نحن نجمع المعلومات التي تقدمها لنا مباشرة، مثل عند إنشاء حساب أو المشاركة في المزايدات. هذا يشمل:

• المعلومات الشخصية (الاسم، البريد الإلكتروني، رقم الهاتف)
• معلومات الدفع والفوترة
• سجل المزايدات والمعاملات
• التفضيلات والإعدادات

نحن نجمع هذه المعلومات لتوفير خدماتنا وتحسين تجربتك.`,
    },
    {
      id: '2',
      title: 'استخدام البيانات',
      content: `نستخدم المعلومات التي نجمعها للأغراض التالية:

• تقديم وتشغيل خدماتنا
• معالجة المعاملات والمدفوعات
• التواصل معك حول حسابك والخدمات
• تحسين وتطوير منصتنا
• ضمان الأمان ومنع الاحتيال
• الامتثال للمتطلبات القانونية

لن نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة.`,
    },
    {
      id: '3',
      title: 'مشاركة البيانات',
      content: `قد نشارك معلوماتك في الحالات التالية:

• مع مقدمي الخدمات الموثوقين الذين يساعدوننا في تشغيل منصتنا
• عند الحاجة للامتثال للقوانين أو الاستجابة للطلبات القانونية
• لحماية حقوقنا أو حقوق المستخدمين الآخرين
• في حالة دمج أو بيع الشركة

جميع الأطراف الثالثة ملزمة بحماية معلوماتك وفقاً لمعايير الخصوصية العالية.`,
    },
    {
      id: '4',
      title: 'أمان البيانات',
      content: `نتخذ تدابير أمنية صارمة لحماية معلوماتك:

• تشفير البيانات أثناء النقل والتخزين
• مراقبة الأنظمة على مدار الساعة
• التحديث المنتظم للأنظمة الأمنية
• تدريب الموظفين على أفضل ممارسات الأمان
• اختبارات الاختراق المنتظمة

رغم جهودنا، لا يمكن ضمان الأمان المطلق عبر الإنترنت.`,
    },
    {
      id: '5',
      title: 'حقوقك',
      content: `لديك الحقوق التالية فيما يتعلق ببياناتك:

• الوصول إلى معلوماتك الشخصية
• تصحيح أو تحديث المعلومات غير الصحيحة
• حذف حسابك ومعلوماتك
• تقييد معالجة بياناتك
• نقل بياناتك إلى خدمة أخرى
• الاعتراض على معالجة معينة

يمكنك ممارسة هذه الحقوق من خلال إعدادات الحساب أو التواصل معنا.`,
    },
    {
      id: '6',
      title: 'ملفات تعريف الارتباط',
      content: `نستخدم ملفات تعريف الارتباط (Cookies) لـ:

• تذكر تفضيلاتك وإعداداتك
• تحليل استخدام الموقع وتحسين الأداء
• تخصيص المحتوى والإعلانات
• ضمان الأمان ومنع الاحتيال

يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات المتصفح أو التطبيق.`,
    },
  ];

  const privacyControls = [
    {
      key: 'dataCollection',
      title: 'جمع البيانات الأساسية',
      description: 'السماح بجمع البيانات الضرورية لتشغيل الخدمة',
      required: true,
    },
    {
      key: 'analytics',
      title: 'التحليلات والإحصائيات',
      description: 'مساعدتنا في تحسين التطبيق من خلال بيانات الاستخدام',
      required: false,
    },
    {
      key: 'marketing',
      title: 'التسويق والإعلانات',
      description: 'تلقي عروض وإعلانات مخصصة',
      required: false,
    },
    {
      key: 'locationTracking',
      title: 'تتبع الموقع',
      description: 'استخدام موقعك لتحسين الخدمات المحلية',
      required: false,
    },
    {
      key: 'notifications',
      title: 'الإشعارات المخصصة',
      description: 'تلقي إشعارات مبنية على نشاطك',
      required: false,
    },
    {
      key: 'profileVisibility',
      title: 'ظهور الملف الشخصي',
      description: 'السماح للمستخدمين الآخرين برؤية ملفك الشخصي',
      required: false,
    },
    {
      key: 'bidHistory',
      title: 'سجل المزايدات العام',
      description: 'إظهار سجل مزايداتك للمستخدمين الآخرين',
      required: false,
    },
  ];

  const renderPrivacySection = (section) => (
    <View key={section.id} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionContent}>{section.content}</Text>
    </View>
  );

  const renderPrivacyControl = (control) => (
    <View key={control.key} style={styles.controlItem}>
      <View style={styles.controlInfo}>
        <Text style={styles.controlTitle}>{control.title}</Text>
        <Text style={styles.controlDescription}>{control.description}</Text>
        {control.required && (
          <Text style={styles.requiredText}>مطلوب للخدمة</Text>
        )}
      </View>
      <Switch
        value={privacySettings[control.key]}
        onValueChange={(value) => handleSettingChange(control.key, value)}
        disabled={control.required}
        trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
        thumbColor={privacySettings[control.key] ? COLORS.primary : COLORS.gray}
      />
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
        <Text style={styles.headerTitle}>الخصوصية</Text>
        <Text style={styles.headerTitleEn}>Privacy Policy</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <View style={styles.introHeader}>
            <Ionicons name="shield-checkmark" size={32} color={COLORS.primary} />
            <Text style={styles.introTitle}>حماية خصوصيتك</Text>
          </View>
          <Text style={styles.introText}>
            نحن ملتزمون بحماية خصوصيتك وأمان بياناتك. تشرح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك الشخصية.
          </Text>
          <Text style={styles.lastUpdated}>آخر تحديث: {lastUpdated}</Text>
        </View>

        {/* Privacy Controls */}
        <View style={styles.controlsSection}>
          <Text style={styles.controlsTitle}>إعدادات الخصوصية</Text>
          <Text style={styles.controlsSubtitle}>
            يمكنك التحكم في كيفية استخدام بياناتك
          </Text>
          <View style={styles.controlsContainer}>
            {privacyControls.map(renderPrivacyControl)}
          </View>
        </View>

        {/* Privacy Policy Sections */}
        <View style={styles.policySection}>
          <Text style={styles.policyTitle}>سياسة الخصوصية التفصيلية</Text>
          {privacySections.map(renderPrivacySection)}
        </View>

        {/* Contact Information */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>أسئلة حول الخصوصية؟</Text>
          <Text style={styles.contactText}>
            إذا كان لديك أي أسئلة حول سياسة الخصوصية أو كيفية التعامل مع بياناتك، يرجى التواصل معنا:
          </Text>
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="mail" size={20} color={COLORS.primary} />
            <Text style={styles.contactButtonText}>privacy@rareanimals.com</Text>
          </TouchableOpacity>
        </View>

        {/* Data Rights */}
        <View style={styles.rightsSection}>
          <Text style={styles.rightsTitle}>حقوقك في البيانات</Text>
          <View style={styles.rightsList}>
            <View style={styles.rightItem}>
              <Ionicons name="eye" size={20} color={COLORS.primary} />
              <Text style={styles.rightText}>عرض بياناتك</Text>
            </View>
            <View style={styles.rightItem}>
              <Ionicons name="create" size={20} color={COLORS.primary} />
              <Text style={styles.rightText}>تعديل المعلومات</Text>
            </View>
            <View style={styles.rightItem}>
              <Ionicons name="download" size={20} color={COLORS.primary} />
              <Text style={styles.rightText}>تحميل البيانات</Text>
            </View>
            <View style={styles.rightItem}>
              <Ionicons name="trash" size={20} color={COLORS.error} />
              <Text style={[styles.rightText, { color: COLORS.error }]}>حذف الحساب</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  introSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    ...SHADOWS.light,
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 12,
  },
  introText: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  lastUpdated: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  controlsSection: {
    marginBottom: 24,
  },
  controlsTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  controlsSubtitle: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  controlsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    ...SHADOWS.light,
  },
  controlItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  controlInfo: {
    flex: 1,
    marginRight: 16,
  },
  controlTitle: {
    fontSize: SIZES.body1,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  controlDescription: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  requiredText: {
    fontSize: SIZES.body3,
    color: COLORS.warning,
    marginTop: 4,
    fontWeight: '500',
  },
  policySection: {
    marginBottom: 24,
  },
  policyTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.light,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  contactSection: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  contactTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  contactText: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  contactButtonText: {
    fontSize: SIZES.body2,
    color: COLORS.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  rightsSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    ...SHADOWS.light,
  },
  rightsTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  rightsList: {
    gap: 12,
  },
  rightItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightText: {
    fontSize: SIZES.body2,
    color: COLORS.text,
    marginLeft: 12,
    fontWeight: '500',
  },
});

export default PrivacyScreen;