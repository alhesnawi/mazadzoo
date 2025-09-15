import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';
const { COLORS, SIZES, SHADOWS } = theme;

const AboutScreen = ({ navigation }) => {
  const appVersion = '1.0.0';
  const buildNumber = '100';
  const releaseDate = '2024-01-15';

  const teamMembers = [
    {
      id: '1',
      name: 'أحمد محمد',
      role: 'المؤسس والرئيس التنفيذي',
      avatar: '👨‍💼',
    },
    {
      id: '2',
      name: 'فاطمة علي',
      role: 'مديرة التطوير',
      avatar: '👩‍💻',
    },
    {
      id: '3',
      name: 'محمد سالم',
      role: 'خبير الحيوانات النادرة',
      avatar: '👨‍🔬',
    },
    {
      id: '4',
      name: 'نورا حسن',
      role: 'مديرة التسويق',
      avatar: '👩‍💼',
    },
  ];

  const features = [
    {
      icon: 'shield-checkmark',
      title: 'أمان عالي',
      description: 'حماية متقدمة لبياناتك ومعاملاتك',
    },
    {
      icon: 'flash',
      title: 'مزايدات فورية',
      description: 'نظام مزايدات سريع وموثوق',
    },
    {
      icon: 'checkmark-done',
      title: 'موثوقية',
      description: 'جميع الحيوانات معتمدة ومفحوصة',
    },
    {
      icon: 'people',
      title: 'مجتمع عالمي',
      description: 'شبكة من محبي الحيوانات النادرة',
    },
  ];

  const socialLinks = [
    {
      platform: 'website',
      icon: 'globe',
      url: 'https://rareanimals.com',
      color: COLORS.primary,
    },
    {
      platform: 'twitter',
      icon: 'logo-twitter',
      url: 'https://twitter.com/rareanimals',
      color: '#1DA1F2',
    },
    {
      platform: 'instagram',
      icon: 'logo-instagram',
      url: 'https://instagram.com/rareanimals',
      color: '#E4405F',
    },
    {
      platform: 'facebook',
      icon: 'logo-facebook',
      url: 'https://facebook.com/rareanimals',
      color: '#1877F2',
    },
  ];

  const handleSocialPress = (url) => {
    Linking.openURL(url);
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:info@rareanimals.com');
  };

  const renderFeature = (feature, index) => (
    <View key={index} style={styles.featureCard}>
      <View style={[styles.featureIcon, { backgroundColor: COLORS.primary + '20' }]}>
        <Ionicons name={feature.icon} size={24} color={COLORS.primary} />
      </View>
      <Text style={styles.featureTitle}>{feature.title}</Text>
      <Text style={styles.featureDescription}>{feature.description}</Text>
    </View>
  );

  const renderTeamMember = (member) => (
    <View key={member.id} style={styles.teamMember}>
      <Text style={styles.memberAvatar}>{member.avatar}</Text>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberRole}>{member.role}</Text>
      </View>
    </View>
  );

  const renderSocialLink = (link) => (
    <TouchableOpacity
      key={link.platform}
      style={[styles.socialButton, { backgroundColor: link.color + '20' }]}
      onPress={() => handleSocialPress(link.url)}
    >
      <Ionicons name={link.icon} size={24} color={link.color} />
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
        <Text style={styles.headerTitle}>حول التطبيق</Text>
        <Text style={styles.headerTitleEn}>About</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Logo and Info */}
        <View style={styles.appInfoSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="paw" size={48} color={COLORS.white} />
            </View>
          </View>
          <Text style={styles.appName}>مزاد الحيوانات النادرة</Text>
          <Text style={styles.appNameEn}>Rare Animals Auction</Text>
          <Text style={styles.appDescription}>
            منصة عالمية لمزايدة الحيوانات النادرة والمهددة بالانقراض
          </Text>
          
          <View style={styles.versionInfo}>
            <Text style={styles.versionText}>الإصدار {appVersion}</Text>
            <Text style={styles.buildText}>Build {buildNumber}</Text>
          </View>
        </View>

        {/* Mission Statement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>رسالتنا</Text>
          <View style={styles.missionCard}>
            <Text style={styles.missionText}>
              نهدف إلى حماية الحيوانات النادرة والمهددة بالانقراض من خلال توفير منصة آمنة وموثوقة للمزايدات، مع ضمان أعلى معايير الرعاية والحماية للحيوانات.
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مميزات التطبيق</Text>
          <View style={styles.featuresGrid}>
            {features.map(renderFeature)}
          </View>
        </View>

        {/* Team */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>فريق العمل</Text>
          <View style={styles.teamContainer}>
            {teamMembers.map(renderTeamMember)}
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إحصائيات</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>حيوان نادر</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>10K+</Text>
              <Text style={styles.statLabel}>مستخدم نشط</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>50+</Text>
              <Text style={styles.statLabel}>دولة</Text>
            </View>
          </View>
        </View>

        {/* Contact & Social */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تواصل معنا</Text>
          <View style={styles.contactCard}>
            <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
              <Ionicons name="mail" size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>info@rareanimals.com</Text>
            </TouchableOpacity>
            
            <View style={styles.socialContainer}>
              <Text style={styles.socialTitle}>تابعنا على:</Text>
              <View style={styles.socialLinks}>
                {socialLinks.map(renderSocialLink)}
              </View>
            </View>
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات قانونية</Text>
          <View style={styles.legalCard}>
            <TouchableOpacity style={styles.legalItem}>
              <Text style={styles.legalText}>شروط الاستخدام</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.legalItem}>
              <Text style={styles.legalText}>سياسة الخصوصية</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.legalItem}>
              <Text style={styles.legalText}>اتفاقية الترخيص</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.copyrightSection}>
          <Text style={styles.copyrightText}>
            © 2024 مزاد الحيوانات النادرة. جميع الحقوق محفوظة.
          </Text>
          <Text style={styles.releaseDate}>تاريخ الإصدار: {releaseDate}</Text>
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
  appInfoSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 24,
    ...SHADOWS.light,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  appName: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  appNameEn: {
    fontSize: SIZES.body1,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  appDescription: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  versionInfo: {
    alignItems: 'center',
  },
  versionText: {
    fontSize: SIZES.body2,
    color: COLORS.text,
    fontWeight: '600',
  },
  buildText: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginTop: 2,
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
  missionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    ...SHADOWS.light,
  },
  missionText: {
    fontSize: SIZES.body2,
    color: COLORS.text,
    lineHeight: 22,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    ...SHADOWS.light,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: SIZES.body1,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  teamContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    ...SHADOWS.light,
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  memberAvatar: {
    fontSize: 32,
    marginRight: 16,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: SIZES.body1,
    fontWeight: '600',
    color: COLORS.text,
  },
  memberRole: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 4,
    ...SHADOWS.light,
  },
  statNumber: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  contactCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    ...SHADOWS.light,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactText: {
    fontSize: SIZES.body1,
    color: COLORS.text,
    marginLeft: 12,
  },
  socialContainer: {
    alignItems: 'center',
  },
  socialTitle: {
    fontSize: SIZES.body2,
    color: COLORS.text,
    marginBottom: 12,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    ...SHADOWS.light,
  },
  legalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  legalText: {
    fontSize: SIZES.body1,
    color: COLORS.text,
  },
  copyrightSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  copyrightText: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  releaseDate: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});

export default AboutScreen;