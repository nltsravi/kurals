import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Linking,
  Share,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeMode } from '../../src/context/ThemeContext';
import { APP_CONFIG } from '../../src/constants/appConstants';

export default function SettingsScreen() {
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);

  const THEME_OPTIONS: { id: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'system', label: 'System', icon: 'phone-portrait-outline' },
    { id: 'light', label: 'Light', icon: 'sunny-outline' },
    { id: 'dark', label: 'Dark', icon: 'moon-outline' },
  ];

  const handleRateApp = () => {
    const playStoreUri = 'market://details?id=com.nltsravi.kurals';
    const webUri = 'https://play.google.com/store/apps/details?id=com.nltsravi.kurals';
    Linking.canOpenURL(playStoreUri)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(playStoreUri);
        }
        return Linking.openURL(webUri);
      })
      .catch(() => Linking.openURL(webUri));
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        title: 'திருக்குறள் (Thirukkural)',
        message:
          'அனைத்து 1,330 திருக்குறள்களையும் தமிழ் & ஆங்கில உரைகளுடன் ஆஃப்லைனில் படிக்க:\n' +
          'Discover all 1,330 Thirukkural couplets with Tamil & English commentaries, completely offline & ad-free.\n\n' +
          'Google Play Store:\nhttps://play.google.com/store/apps/details?id=com.nltsravi.kurals',
      });
    } catch {
      // User cancelled or share error
    }
  };

  const handleOpenPrivacyWeb = () => {
    Linking.openURL('https://nltsravi.github.io/kurals/');
  };

  const handleOpenGithub = () => {
    Linking.openURL('https://github.com/nltsravi/kurals');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>அமைப்புகள்</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Settings & About</Text>
        </View>

        {/* Theme Settings */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>தோற்றம் (Appearance / Theme)</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
            Choose your preferred reading color scheme
          </Text>

          <View style={styles.themeOptionsRow}>
            {THEME_OPTIONS.map((opt) => {
              const isSelected = themeMode === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.themeBtn,
                    {
                      backgroundColor: isSelected
                        ? colors.primaryLight
                        : (isDark ? colors.surface : colors.card),
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setThemeMode(opt.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Ionicons
                    name={opt.icon}
                    size={20}
                    color={isSelected ? colors.primary : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.themeBtnText,
                      { color: isSelected ? colors.primary : colors.text },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Support & Share on Google Play */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>ஆதரவு & பகிர் (Support & Share)</Text>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleRateApp}
            accessibilityRole="button"
            accessibilityLabel="Rate on Google Play"
          >
            <View style={[styles.iconBadge, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="star" size={20} color={colors.primary} />
            </View>
            <View style={styles.actionRowText}>
              <Text style={[styles.actionLabel, { color: colors.text }]}>மதிப்பீடு செய் (Rate on Google Play)</Text>
              <Text style={[styles.actionSubtext, { color: colors.textSecondary }]}>
                Help others discover Tamil wisdom with a 5-star review
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleShareApp}
            accessibilityRole="button"
            accessibilityLabel="Share App"
          >
            <View style={[styles.iconBadge, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="share-social-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.actionRowText}>
              <Text style={[styles.actionLabel, { color: colors.text }]}>நண்பர்களுடன் பகிர் (Share App)</Text>
              <Text style={[styles.actionSubtext, { color: colors.textSecondary }]}>
                Share this ad-free Thirukkural app with friends & family
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Privacy & Data Safety */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>தனியுரிமை & பாதுகாப்பு (Privacy & Safety)</Text>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => setPrivacyModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Privacy Policy"
          >
            <View style={[styles.iconBadge, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#16A34A" />
            </View>
            <View style={styles.actionRowText}>
              <Text style={[styles.actionLabel, { color: colors.text }]}>தனியுரிமைக் கொள்கை (Privacy Policy)</Text>
              <Text style={[styles.actionSubtext, { color: colors.textSecondary }]}>
                Zero data collected • 100% private & ad-free
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.actionRow}>
            <View style={[styles.iconBadge, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="lock-closed-outline" size={20} color="#0284C7" />
            </View>
            <View style={styles.actionRowText}>
              <Text style={[styles.actionLabel, { color: colors.text }]}>Google Play Data Safety</Text>
              <Text style={[styles.actionSubtext, { color: colors.textSecondary }]}>
                No personal data collected or shared. Your collections stay on your device.
              </Text>
            </View>
          </View>
        </View>

        {/* Offline & Data Info */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>தரவு தகவல் (Data & Offline)</Text>

          <View style={styles.infoRow}>
            <Ionicons name="cloud-offline-outline" size={20} color={colors.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>100% Offline-First</Text>
              <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                Works completely without internet. All 1,330 Kurals are bundled on your device.
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.infoRow}>
            <Ionicons name="library-outline" size={20} color={colors.accent} />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>Dataset Content</Text>
              <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                3 பால் (Sections) • 133 அதிகாரம் (Chapters) • 1,330 குறள்கள்
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.infoRow}>
            <Ionicons name="chatbubbles-outline" size={20} color="#10B981" />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>Commentaries Included</Text>
              <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                Mu. Varadarajan (மு.வ), Solomon Pappaiah (சாலமன் பாப்பையா), Kalaignar Karunanidhi (மு.க), & English Pope Couplet
              </Text>
            </View>
          </View>
        </View>

        {/* About App */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>செயலி பற்றி (About App)</Text>

          <View style={styles.aboutHeader}>
            <View style={[styles.appLogo, { backgroundColor: colors.primaryLight }]}>
              <Text style={{ fontSize: 24, color: colors.primary, fontWeight: '700' }}>குறள்</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.appName, { color: colors.text }]}>{APP_CONFIG.name}</Text>
              <Text style={[styles.appVersion, { color: colors.textMuted }]}>
                Version {APP_CONFIG.version} (Build 1) • com.nltsravi.kurals
              </Text>
            </View>
          </View>

          <Text style={[styles.aboutDescription, { color: colors.textSecondary }]}>
            The Tirukkuṟaḷ is a classic Tamil language text consisting of 1,330 short couplets of seven words each. Considered one of the greatest works on ethics and morality, it is universally revered as the 'Ulaga Podhu Marai' (Universal Veda).
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.borderLight, marginTop: 14 }]} />

          <TouchableOpacity
            style={[styles.actionRow, { paddingVertical: 10 }]}
            onPress={handleOpenGithub}
            accessibilityRole="button"
          >
            <View style={[styles.iconBadge, { backgroundColor: isDark ? colors.surface : '#F3F4F6' }]}>
              <Ionicons name="logo-github" size={20} color={colors.text} />
            </View>
            <View style={styles.actionRowText}>
              <Text style={[styles.actionLabel, { color: colors.text }]}>GitHub Repository</Text>
              <Text style={[styles.actionSubtext, { color: colors.textSecondary }]}>
                Open-source on GitHub (nltsravi/kurals)
              </Text>
            </View>
            <Ionicons name="open-outline" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Privacy Policy Modal */}
      <Modal
        visible={privacyModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>தனியுரிமைக் கொள்கை</Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>Privacy Policy</Text>
            </View>
            <TouchableOpacity
              onPress={() => setPrivacyModalVisible(false)}
              style={[styles.modalCloseBtn, { backgroundColor: colors.surface }]}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.policyHighlight, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}>
              <Ionicons name="shield-checkmark" size={24} color="#16A34A" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontWeight: '700', color: '#14532D', fontSize: 14 }}>
                  Zero Personal Data Collection
                </Text>
                <Text style={{ color: '#166534', fontSize: 12.5, marginTop: 2 }}>
                  This application does not collect, transmit, share, or store any personal user information.
                </Text>
              </View>
            </View>

            <Text style={[styles.policySectionHeading, { color: colors.text }]}>1. Overview</Text>
            <Text style={[styles.policyParagraph, { color: colors.textSecondary }]}>
              The Thirukkural (திருக்குறள்) mobile app is built by NLTS Ravi as an offline, open, educational reference app. It is designed with privacy-by-default architecture.
            </Text>

            <Text style={[styles.policySectionHeading, { color: colors.text }]}>2. Information Collection and Use</Text>
            <Text style={[styles.policyParagraph, { color: colors.textSecondary }]}>
              • No user accounts, registration, or logins are required.{'\n'}
              • No device identifiers, advertising IDs, or telemetry are recorded.{'\n'}
              • No analytics trackers, crash reporting SDKs, or ad networks are installed.
            </Text>

            <Text style={[styles.policySectionHeading, { color: colors.text }]}>3. On-Device Local Storage</Text>
            <Text style={[styles.policyParagraph, { color: colors.textSecondary }]}>
              Any bookmarks, favorites, notes, or custom collections you create remain strictly on your device using secure local storage. This data never leaves your device and is deleted when you uninstall the app.
            </Text>

            <Text style={[styles.policySectionHeading, { color: colors.text }]}>4. Network & Permissions</Text>
            <Text style={[styles.policyParagraph, { color: colors.textSecondary }]}>
              The app requires zero sensitive runtime permissions (no camera, microphone, contacts, location, or storage permissions required). The complete dataset of 1,330 couplets is bundled inside the app for 100% offline usage.
            </Text>

            <Text style={[styles.policySectionHeading, { color: colors.text }]}>5. Children's Privacy</Text>
            <Text style={[styles.policyParagraph, { color: colors.textSecondary }]}>
              The app does not address anyone under the age of 13 specifically, nor does it collect personally identifiable information from children or adults. It complies fully with COPPA and Google Play Families policies.
            </Text>

            <TouchableOpacity
              style={[styles.webPolicyButton, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
              onPress={handleOpenPrivacyWeb}
            >
              <Ionicons name="globe-outline" size={18} color={colors.primary} />
              <Text style={[styles.webPolicyButtonText, { color: colors.primary }]}>
                View Online Privacy Policy (GitHub Pages)
              </Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  sectionCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12.5,
    marginBottom: 14,
  },
  themeOptionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  themeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  themeBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  actionRowText: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  actionSubtext: {
    fontSize: 12,
    lineHeight: 16,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 14,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 8,
    marginBottom: 12,
  },
  appLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 17,
    fontWeight: '700',
  },
  appVersion: {
    fontSize: 12,
    marginTop: 2,
  },
  aboutDescription: {
    fontSize: 13,
    lineHeight: 20,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  policyHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  policySectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 6,
  },
  policyParagraph: {
    fontSize: 13,
    lineHeight: 20,
  },
  webPolicyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 24,
  },
  webPolicyButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
});
