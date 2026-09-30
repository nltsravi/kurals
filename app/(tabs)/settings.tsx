import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeMode } from '../../src/context/ThemeContext';
import { APP_CONFIG } from '../../src/constants/appConstants';

export default function SettingsScreen() {
  const { colors, isDark, themeMode, setThemeMode } = useTheme();

  const THEME_OPTIONS: { id: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'system', label: 'System', icon: 'phone-portrait-outline' },
    { id: 'light', label: 'Light', icon: 'sunny-outline' },
    { id: 'dark', label: 'Dark', icon: 'moon-outline' },
  ];

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
                        ? (isDark ? '#082F49' : colors.primaryLight)
                        : (isDark ? colors.surface : '#FFFFFF'),
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
            <View>
              <Text style={[styles.appName, { color: colors.text }]}>{APP_CONFIG.name}</Text>
              <Text style={[styles.appVersion, { color: colors.textMuted }]}>
                Version {APP_CONFIG.version} • Production Release
              </Text>
            </View>
          </View>

          <Text style={[styles.aboutDescription, { color: colors.textSecondary }]}>
            The Tirukkuṟaḷ is a classic Tamil language text consisting of 1,330 short couplets of seven words each. Considered one of the greatest works on ethics and morality, it is universally revered as the 'Ulaga Podhu Marai' (Universal Veda).
          </Text>
        </View>
      </ScrollView>
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
    marginVertical: 6,
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
});
