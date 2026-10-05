import React, { useState, useMemo, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
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
import { KuralImageCard } from './KuralImageCard';

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
  const imageCardRef = useRef<View>(null);

  const [shareTab, setShareTab] = useState<'image' | 'text'>('image');
  const [meaningType, setMeaningType] = useState<MeaningType>('mv');
  const [includeTransliteration, setIncludeTransliteration] = useState(false);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  /**
   * Captures the KuralImageCard component as a high-resolution PNG image
   */
  const captureImageUri = async (): Promise<string | null> => {
    if (!imageCardRef.current) return null;
    try {
      setIsProcessing(true);
      const uri = await captureRef(imageCardRef, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });
      return uri;
    } catch (error) {
      console.error('Error capturing image card:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Primary action: Share the generated image card via the system share sheet
   */
  const handleShareImage = async () => {
    if (!kural) return;

    try {
      showToast('Creating image card...');
      const uri = await captureImageUri();
      if (!uri) {
        showToast('Could not create image. Sharing text instead...');
        await ShareService.shareText(formattedShareText);
        return;
      }

      // Also copy text to clipboard for convenience
      await ShareService.copyToClipboard(formattedShareText);
      await ShareService.shareImage(uri, `குறள் ${kural.number} | Thirukkural`);
      showToast('Image shared!');
    } catch (err) {
      console.error('Failed to share image:', err);
      await ShareService.shareText(formattedShareText);
    }
  };

  /**
   * Shares image or text to a specific social platform
   */
  const handleSharePlatform = async (platform: SocialPlatform) => {
    if (!kural) return;

    try {
      if (shareTab === 'image') {
        showToast('Preparing image card...');
        const uri = await captureImageUri();

        // Copy text to clipboard so it can be pasted in WhatsApp/Instagram/Facebook
        await ShareService.copyToClipboard(formattedShareText);

        if (uri) {
          if (platform === 'whatsapp_status') {
            await ShareService.shareImage(uri, `குறள் ${kural.number}`);
            showToast('Opening WhatsApp! Select "My Status" to set as status.');
            return;
          } else if (platform === 'instagram') {
            await ShareService.shareImage(uri, `குறள் ${kural.number}`);
            showToast('Opening Instagram! Choose Story or Feed.');
            return;
          } else if (platform === 'facebook') {
            await ShareService.shareImage(uri, `குறள் ${kural.number}`);
            showToast('Opening Facebook! Caption copied to clipboard.');
            return;
          } else if (platform === 'twitter' || platform === 'threads') {
            await ShareService.shareImage(uri, `குறள் ${kural.number}`);
            showToast('Image ready to post!');
            return;
          } else {
            await ShareService.shareImage(uri, `குறள் ${kural.number}`);
            return;
          }
        }
      }

      // Text fallback
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
      showToast('Could not open app. Copied text to clipboard instead.');
      await ShareService.copyToClipboard(formattedShareText);
    }
  };

  /**
   * Copies formatted Kural text and meaning to clipboard
   */
  const handleCopyText = async () => {
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

          {/* Mode Switcher Tabs (Image Card vs Text) */}
          <View style={[styles.tabBar, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                shareTab === 'image' && [
                  styles.tabBtnActive,
                  { backgroundColor: colors.card, shadowColor: '#000' },
                ],
              ]}
              onPress={() => setShareTab('image')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="image"
                size={16}
                color={shareTab === 'image' ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  { color: shareTab === 'image' ? colors.primary : colors.textSecondary },
                ]}
              >
                படம் (Image Card)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                shareTab === 'text' && [
                  styles.tabBtnActive,
                  { backgroundColor: colors.card, shadowColor: '#000' },
                ],
              ]}
              onPress={() => setShareTab('text')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="document-text-outline"
                size={16}
                color={shareTab === 'text' ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  { color: shareTab === 'text' ? colors.primary : colors.textSecondary },
                ]}
              >
                உரை (Text Format)
              </Text>
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
            {/* Meaning Selector (Live-updates Image and Text) */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                பொருள் / உரை தேர்வு (Select Meaning)
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

            {/* Main Preview Area: Image Card or Text Card */}
            {shareTab === 'image' ? (
              <View style={styles.imagePreviewContainer}>
                <View style={styles.previewTagRow}>
                  <Ionicons name="sparkles" size={14} color={colors.primary} />
                  <Text style={[styles.previewLabel, { color: colors.primary }]}>
                    HD IMAGE CARD PREVIEW (1:1 SQUARE)
                  </Text>
                </View>

                {/* The Captured Image Card */}
                <View style={styles.imageCardWrapper}>
                  <KuralImageCard
                    ref={imageCardRef}
                    kural={kural}
                    meaningType={meaningType}
                  />
                </View>

                {/* Primary Share Image Button */}
                <TouchableOpacity
                  style={[styles.heroShareImageBtn, { backgroundColor: colors.primary }]}
                  onPress={handleShareImage}
                  disabled={isProcessing}
                  activeOpacity={0.85}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="share-social" size={20} color="#FFFFFF" />
                  )}
                  <Text style={styles.heroShareImageBtnText}>
                    {isProcessing ? 'படம் உருவாக்கப்படுகிறது...' : 'படம் பகிர் (Share Image Card)'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Text Mode Preview */
              <View>
                {/* Options Row (Translit & Hashtags) */}
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

                {/* Text Preview Card */}
                <View style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.previewHeader}>
                    <View style={styles.previewTagRow}>
                      <Ionicons name="eye-outline" size={14} color={colors.textMuted} />
                      <Text style={[styles.previewLabel, { color: colors.textMuted }]}>
                        LIVE TEXT PREVIEW
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

                  <Text style={[styles.previewText, { color: colors.textSecondary }]}>
                    {formattedShareText}
                  </Text>
                </View>
              </View>
            )}

            {/* Social Share Grid */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {shareTab === 'image'
                  ? 'படத்தை சமூக வலைத்தளங்களில் பகிர (Share Image to Apps)'
                  : 'உரையை சமூக வலைத்தளங்களில் பகிர (Share Text to Apps)'}
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
                      {shareTab === 'image'
                        ? 'Set image card as your WhatsApp status'
                        : 'Set text status or share to chat'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>

                {/* 2. Instagram */}
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
                      {shareTab === 'image'
                        ? 'Share image card to Instagram Story or Feed'
                        : 'Copy text & open Instagram'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>

                {/* 3. Twitter / X */}
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
                      {shareTab === 'image'
                        ? 'Tweet with Kural image card'
                        : 'Post tweet with Kural & meaning'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>

                {/* 4. Threads */}
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
                      {shareTab === 'image'
                        ? 'Share image card to Threads'
                        : 'Share post to Threads'}
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
                      {shareTab === 'image'
                        ? 'Share image card to Facebook Feed / Story'
                        : 'Copy & post to Facebook'}
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
                  onPress={() => (shareTab === 'image' ? handleShareImage() : handleSharePlatform('native'))}
                  activeOpacity={0.7}
                >
                  <View style={[styles.socialIconCircle, { backgroundColor: colors.primary }]}>
                    <Ionicons name="share-social-outline" size={22} color="#FFFFFF" />
                  </View>
                  <View style={styles.socialCardContent}>
                    <View style={styles.socialTitleRow}>
                      <Text style={[styles.socialName, { color: colors.text }]}>
                        More Options (அனைத்தும்)
                      </Text>
                    </View>
                    <Text style={[styles.socialDesc, { color: colors.textMuted }]}>
                      Device share sheet (Telegram, SMS, Save Image)
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Bar: Quick Copy Kural Text Button */}
          <View style={[styles.footer, { borderTopColor: colors.borderLight }]}>
            <TouchableOpacity
              style={[
                styles.copyTextBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={handleCopyText}
              activeOpacity={0.8}
            >
              <Ionicons name="copy-outline" size={18} color={colors.primary} />
              <Text style={[styles.copyTextBtnTitle, { color: colors.text }]}>
                குறள் உரையை நகலெடு (Copy Kural Text)
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
    maxHeight: '92%',
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
    paddingTop: 16,
    paddingBottom: 12,
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
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 18,
    marginTop: 10,
    marginBottom: 4,
    padding: 3,
    borderRadius: 12,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 9,
  },
  tabBtnActive: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 16,
    marginHorizontal: 18,
    marginTop: 8,
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
    fontSize: 13.5,
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
  imagePreviewContainer: {
    marginBottom: 20,
  },
  previewTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  imageCardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 14,
  },
  heroShareImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  heroShareImageBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
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
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  copyTextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  copyTextBtnTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
});
