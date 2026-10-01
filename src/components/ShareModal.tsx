import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Kural } from '../types/kural';
import { useTheme } from '../context/ThemeContext';
import {
  ShareService,
  SocialPlatform,
  SocialShareResult,
} from '../services/shareService';
import {
  MeaningType,
  SocialShareOptions,
  formatKuralForSocialShare,
} from '../utils/text';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  kural: Kural | null;
}

interface MeaningOption {
  type: MeaningType;
  label: string;
  subLabel: string;
}

const MEANING_OPTIONS: MeaningOption[] = [
  { type: 'mv', label: 'மு.வ. உரை', subLabel: 'Dr. Mu. Va' },
  { type: 'sp', label: 'சாலமன் பாப்பையா', subLabel: 'S. Pappaiah' },
  { type: 'mk', label: 'கலைஞர் உரை', subLabel: 'M. Karunanidhi' },
  { type: 'translation', label: 'English', subLabel: 'Translation' },
  { type: 'both', label: 'மு.வ + English', subLabel: 'Tamil & Eng' },
];

export const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  kural,
}) => {
  const { colors, isDark } = useTheme();

  const [meaningType, setMeaningType] = useState<MeaningType>('mv');
  const [includeTransliteration, setIncludeTransliteration] = useState(false);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const shareOptions: SocialShareOptions = useMemo(
    () => ({
      meaningType,
      includeTransliteration,
      includeHashtags,
      includeStructure: true,
    }),
    [meaningType, includeTransliteration, includeHashtags]
  );

  const formattedShareText = useMemo(() => {
    if (!kural) return '';
    return formatKuralForSocialShare(kural, shareOptions);
  }, [kural, shareOptions]);

  const charCount = formattedShareText.length;
  const isWithinTwitterLimit = charCount <= 280;

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSharePlatform = async (platform: SocialPlatform) => {
    if (!kural) return;

    try {
      const result: SocialShareResult = await ShareService.shareToPlatform(
        platform,
        formattedShareText,
        `குறள் ${kural.number}`
      );

      if (result.message) {
        showToast(result.message);
      } else if (result.success) {
        showToast('Shared successfully!');
      }
    } catch {
      showToast('Could not open app. Copied to clipboard instead.');
      await ShareService.copyToClipboard(formattedShareText);
    }
  };

  const handleCopy = async () => {
    await ShareService.copyToClipboard(formattedShareText);
    showToast('குறள் மற்றும் பொருள் நகலெடுக்கப்பட்டது! (Copied to clipboard!)');
  };

  if (!kural) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.headerBadgeText, { color: colors.primary }]}>
                  குறள் {kural.number}
                </Text>
              </View>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  பகிர் & உரை | Share Kural
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  {kural.chapterNameTamil} • {kural.categoryTamil}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surface }]}
              accessibilityLabel="Close"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Toast Notification Banner */}
          {toastMessage && (
            <View style={[styles.toastBanner, { backgroundColor: colors.primary }]}>
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.toastBannerText}>{toastMessage}</Text>
            </View>
          )}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Meaning Selector */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                பொருள் / உரை (Meaning)
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.meaningPillsContainer}
              >
                {MEANING_OPTIONS.map((item) => {
                  const isSelected = meaningType === item.type;
                  return (
                    <TouchableOpacity
                      key={item.type}
                      style={[
                        styles.meaningPill,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.card,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setMeaningType(item.type)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.meaningPillTitle,
                          { color: isSelected ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Text
                        style={[
                          styles.meaningPillSub,
                          { color: isSelected ? 'rgba(255,255,255,0.85)' : colors.textMuted },
                        ]}
                      >
                        {item.subLabel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Formatting Options (Transliteration & Hashtags) */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: includeTransliteration ? colors.primaryLight : colors.card,
                    borderColor: includeTransliteration ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setIncludeTransliteration(!includeTransliteration)}
              >
                <Ionicons
                  name={includeTransliteration ? 'checkbox' : 'square-outline'}
                  size={16}
                  color={includeTransliteration ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.optionChipText,
                    { color: includeTransliteration ? colors.primary : colors.textSecondary },
                  ]}
                >
                  English Translit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: includeHashtags ? colors.primaryLight : colors.card,
                    borderColor: includeHashtags ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setIncludeHashtags(!includeHashtags)}
              >
                <Ionicons
                  name={includeHashtags ? 'checkbox' : 'square-outline'}
                  size={16}
                  color={includeHashtags ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.optionChipText,
                    { color: includeHashtags ? colors.primary : colors.textSecondary },
                  ]}
                >
                  Hashtags (#)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Live Preview Card */}
            <View style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.previewHeader}>
                <View style={styles.previewTagRow}>
                  <Ionicons name="eye-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.previewLabel, { color: colors.textMuted }]}>
                    LIVE PREVIEW
                  </Text>
                </View>

                <View
                  style={[
                    styles.charBadge,
                    {
                      backgroundColor: isWithinTwitterLimit
                        ? (isDark ? '#064E3B' : '#D1FAE5')
                        : (isDark ? '#451A03' : '#FEF3C7'),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.charBadgeText,
                      { color: isWithinTwitterLimit ? '#10B981' : '#D97706' },
                    ]}
                  >
                    {charCount} chars {isWithinTwitterLimit ? '• X ✓' : ''}
                  </Text>
                </View>
              </View>

              <Text style={[styles.previewText, { color: colors.textSecondary }]} numberOfLines={9}>
                {formattedShareText}
              </Text>

              <View style={[styles.previewFooter, { borderTopColor: colors.borderLight }]}>
                <TouchableOpacity
                  style={styles.quickCopyBtn}
                  onPress={handleCopy}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons name="copy-outline" size={14} color={colors.primary} />
                  <Text style={[styles.quickCopyText, { color: colors.primary }]}>
                    Copy Text
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Social Share Grid */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                சமூக வலைத்தளங்கள் (Social Sites)
              </Text>

              <View style={styles.socialGrid}>
                {/* 1. WhatsApp Status */}
                <TouchableOpacity
                  style={[
                    styles.socialCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                  onPress={() => handleSharePlatform('whatsapp_status')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.socialIconCircle, { backgroundColor: '#25D366' }]}>
                    <Ionicons name="logo-whatsapp" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.socialCardContent}>
                    <View style={styles.socialTitleRow}>
                      <Text style={[styles.socialName, { color: colors.text }]}>
                        WhatsApp Status
                      </Text>
                      <View style={[styles.platformBadge, { backgroundColor: '#DCFCE7' }]}>
                        <Text style={[styles.platformBadgeText, { color: '#166534' }]}>
                          Status
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.socialDesc, { color: colors.textMuted }]}>
                      Set as status or share to chat
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>

                {/* 2. Twitter / X */}
                <TouchableOpacity
                  style={[
                    styles.socialCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                  onPress={() => handleSharePlatform('twitter')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.socialIconCircle, { backgroundColor: '#0F1419' }]}>
                    <Ionicons name="logo-twitter" size={22} color="#FFFFFF" />
                  </View>
                  <View style={styles.socialCardContent}>
                    <View style={styles.socialTitleRow}>
                      <Text style={[styles.socialName, { color: colors.text }]}>
                        X (Twitter)
                      </Text>
                    </View>
                    <Text style={[styles.socialDesc, { color: colors.textMuted }]}>
                      Post tweet with Kural & meaning
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>

                {/* 3. Threads */}
                <TouchableOpacity
                  style={[
                    styles.socialCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                  onPress={() => handleSharePlatform('threads')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.socialIconCircle, { backgroundColor: '#101010' }]}>
                    <Ionicons name="at" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.socialCardContent}>
                    <View style={styles.socialTitleRow}>
                      <Text style={[styles.socialName, { color: colors.text }]}>
                        Threads
                      </Text>
                    </View>
                    <Text style={[styles.socialDesc, { color: colors.textMuted }]}>
                      Share post to Threads
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>

                {/* 4. Instagram */}
                <TouchableOpacity
                  style={[
                    styles.socialCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                  onPress={() => handleSharePlatform('instagram')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.socialIconCircle, { backgroundColor: '#E1306C' }]}>
                    <Ionicons name="logo-instagram" size={22} color="#FFFFFF" />
                  </View>
                  <View style={styles.socialCardContent}>
                    <View style={styles.socialTitleRow}>
                      <Text style={[styles.socialName, { color: colors.text }]}>
                        Instagram
                      </Text>
                      <View style={[styles.platformBadge, { backgroundColor: '#FCE7F3' }]}>
                        <Text style={[styles.platformBadgeText, { color: '#9D174D' }]}>
                          Story / Post
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.socialDesc, { color: colors.textMuted }]}>
                      Copy & open Instagram
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>

                {/* 5. Facebook */}
                <TouchableOpacity
                  style={[
                    styles.socialCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                  onPress={() => handleSharePlatform('facebook')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.socialIconCircle, { backgroundColor: '#1877F2' }]}>
                    <Ionicons name="logo-facebook" size={22} color="#FFFFFF" />
                  </View>
                  <View style={styles.socialCardContent}>
                    <View style={styles.socialTitleRow}>
                      <Text style={[styles.socialName, { color: colors.text }]}>
                        Facebook
                      </Text>
                    </View>
                    <Text style={[styles.socialDesc, { color: colors.textMuted }]}>
                      Share or paste into Facebook post
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>

                {/* 6. System Share Sheet */}
                <TouchableOpacity
                  style={[
                    styles.socialCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                  onPress={() => handleSharePlatform('native')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.socialIconCircle, { backgroundColor: colors.primary }]}>
                    <Ionicons name="share-social-outline" size={22} color="#FFFFFF" />
                  </View>
                  <View style={styles.socialCardContent}>
                    <View style={styles.socialTitleRow}>
                      <Text style={[styles.socialName, { color: colors.text }]}>
                        More Options
                      </Text>
                    </View>
                    <Text style={[styles.socialDesc, { color: colors.textMuted }]}>
                      Device share sheet (Telegram, SMS, Mail)
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Full-Width Copy Action */}
          <View style={[styles.footer, { borderTopColor: colors.borderLight }]}>
            <TouchableOpacity
              style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
              onPress={handleCopy}
              activeOpacity={0.8}
            >
              <Ionicons name="copy-outline" size={18} color="#FFFFFF" />
              <Text style={styles.primaryActionBtnText}>
                முழு உரையை நகலெடு (Copy Formatted Text)
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    maxHeight: '90%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  headerBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: 16.5,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 10,
  },
  toastBannerText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 24,
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  meaningPillsContainer: {
    gap: 8,
    paddingVertical: 2,
  },
  meaningPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 95,
  },
  meaningPillTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  meaningPillSub: {
    fontSize: 10.5,
    marginTop: 2,
    fontWeight: '500',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  optionChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  optionChipText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  previewCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  charBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  charBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  previewText: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  previewFooter: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  quickCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  quickCopyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  socialGrid: {
    gap: 10,
  },
  socialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  socialIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  socialCardContent: {
    flex: 1,
  },
  socialTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  socialName: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  platformBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  platformBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  socialDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
});
