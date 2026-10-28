import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { KuralService } from '../../src/services/kuralService';
import { ShareService } from '../../src/services/shareService';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { useCollections } from '../../src/context/CollectionContext';
import { useLearningMode } from '../../src/context/LearningModeContext';
import { AddToCollectionModal } from '../../src/components/AddToCollectionModal';
import { ExportModal } from '../../src/components/ExportModal';
import { ShareModal } from '../../src/components/ShareModal';
import { formatKuralText } from '../../src/utils/text';
import { KuralCoupletText } from '../../src/components/KuralCoupletText';
import { KuralPronunciationTrainer } from '../../src/components/KuralPronunciationTrainer';

export default function KuralDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { t, isEnglish } = useLanguage();
  const { collections } = useCollections();
  const { isLearningModeEnabled } = useLearningMode();

  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);

  const kuralNumber = parseInt(id || '1', 10);
  const kural = KuralService.getKuralByNumber(kuralNumber);

  if (!kural) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          {isEnglish ? 'Kural not found' : 'குறள் கிடைக்கவில்லை'}
        </Text>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backBtnText}>
            {isEnglish ? 'Go Back' : 'பின்னே செல்'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isSaved = collections.some((c) => c.kuralNumbers.includes(kural.number));

  const showNotice = (msg: string) => {
    setCopiedNotice(msg);
    setTimeout(() => setCopiedNotice(null), 2000);
  };

  const handleCopyTamil = async () => {
    const text = formatKuralText(kural, 'tamil');
    await ShareService.copyToClipboard(text);
    showNotice(t.kuralDetailScreen.toastTamilCopied);
  };

  const handleCopyTransliteration = async () => {
    const text = formatKuralText(kural, 'transliteration');
    await ShareService.copyToClipboard(text);
    showNotice(t.kuralDetailScreen.toastTranslitCopied);
  };

  const handleCopyBoth = async () => {
    const text = formatKuralText(kural, 'both');
    await ShareService.copyToClipboard(text);
    showNotice(t.kuralDetailScreen.toastBothCopied);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const goToPrev = () => {
    if (kural.number > 1) {
      router.replace(`/kural/${kural.number - 1}`);
    }
  };

  const goToNext = () => {
    if (kural.number < 1330) {
      router.replace(`/kural/${kural.number + 1}`);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: isEnglish ? `Kural ${kural.number}` : `குறள் ${kural.number}`,
          headerRight: () => (
            <View style={styles.headerRightActions}>
              <TouchableOpacity
                onPress={() => setShowAddToCollection(true)}
                style={styles.headerIconBtn}
                accessibilityLabel="Bookmark Kural"
              >
                <Ionicons
                  name={isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={22}
                  color={isSaved ? colors.accent : colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleShare}
                style={styles.headerIconBtn}
                accessibilityLabel="Share Kural"
              >
                <Ionicons name="share-outline" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {copiedNotice && (
          <View style={[styles.toast, { backgroundColor: colors.primary }]}>
            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
            <Text style={styles.toastText}>{copiedNotice}</Text>
          </View>
        )}

        {/* Primary Kural Card */}
        <View style={[styles.mainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.kuralBadgeRow}>
            <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.badgeText, { color: isDark ? '#FED7AA' : colors.primary }]}>
                {isEnglish ? `Kural ${kural.number}` : `குறள் ${kural.number}`}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/chapter/${kural.chapterNumber}`)}
              style={styles.chapterBadgeLink}
            >
              <Text style={[styles.chapterLinkText, { color: colors.textSecondary }]} numberOfLines={1}>
                {isEnglish
                  ? `${kural.chapterTransliteration || kural.chapterNameEnglish} →`
                  : `${kural.chapterNameTamil} →`}
              </Text>
            </TouchableOpacity>
          </View>

          <KuralCoupletText
            line1={kural.line1}
            line2={kural.line2}
            tamil={kural.tamil}
            color={colors.text}
            baseFontSize={18.5}
            fontWeight="700"
            containerStyle={styles.tamilTextContainer}
          />

          {kural.transliteration ? (
            <View style={[styles.transliterationContainer, { borderTopColor: colors.borderLight }]}>
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                {t.kuralDetailScreen.transliterationHeader}
              </Text>
              <Text style={[styles.transliterationText, { color: colors.textSecondary }]}>
                {kural.transliteration}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Primary Action Bar: Share & Export */}
        <View style={styles.actionsBar}>
          <TouchableOpacity
            style={[styles.actionChip, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
            onPress={() => setShowShareModal(true)}
            accessibilityRole="button"
            accessibilityLabel={t.kuralDetailScreen.shareKural}
          >
            <Ionicons name="share-social-outline" size={15} color={colors.primary} />
            <Text style={[styles.actionChipText, { color: colors.primary, fontWeight: '700' }]} numberOfLines={1}>
              {t.kuralDetailScreen.shareKural}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionChip, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowExportModal(true)}
            accessibilityRole="button"
            accessibilityLabel={t.kuralDetailScreen.exportDoc}
          >
            <Ionicons name="download-outline" size={15} color={colors.accent} />
            <Text style={[styles.actionChipText, { color: colors.text }]} numberOfLines={1}>
              {t.kuralDetailScreen.exportDoc}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Copy Text Action Bar: Displayed below for proper button label alignment */}
        <View style={styles.copyActionsBar}>
          <TouchableOpacity
            style={[styles.copyChip, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleCopyTamil}
            accessibilityRole="button"
            accessibilityLabel="Copy Tamil Kural text"
          >
            <Ionicons name="copy-outline" size={14} color={colors.primary} />
            <Text style={[styles.copyChipText, { color: colors.text }]} numberOfLines={1}>
              {t.kuralDetailScreen.copyTamil}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.copyChip, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleCopyTransliteration}
            accessibilityRole="button"
            accessibilityLabel="Copy transliteration"
          >
            <Ionicons name="copy-outline" size={14} color={colors.primary} />
            <Text style={[styles.copyChipText, { color: colors.text }]} numberOfLines={1}>
              {t.kuralDetailScreen.copyTranslit}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.copyChip, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleCopyBoth}
            accessibilityRole="button"
            accessibilityLabel="Copy Tamil and transliteration"
          >
            <Ionicons name="copy-outline" size={14} color={colors.primary} />
            <Text style={[styles.copyChipText, { color: colors.text }]} numberOfLines={1}>
              {t.kuralDetailScreen.copyBoth}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tamil Reading & Pronunciation Learning Trainer (when Learning Mode is enabled) */}
        {isLearningModeEnabled && <KuralPronunciationTrainer kural={kural} />}

        {/* English Translation */}
        {kural.translation ? (
          <View style={[styles.detailSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionHeader, { color: colors.text }]}>{t.kuralDetailScreen.translationHeader}</Text>
            <Text style={[styles.bodyText, { color: colors.textSecondary }]}>{kural.translation}</Text>
            {kural.couplet ? (
              <View style={[styles.coupletBox, { backgroundColor: colors.surface }]}>
                <Text style={[styles.coupletLabel, { color: colors.textMuted }]}>G.U. Pope Couplet:</Text>
                <Text style={[styles.coupletText, { color: colors.textSecondary }]}>
                  {kural.couplet}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Commentaries (உரைகள் / Urai) */}
        <View style={[styles.detailSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionHeader, { color: colors.text }]}>{t.kuralDetailScreen.commentaryHeader}</Text>

          {kural.commentaryMV ? (
            <View style={styles.commentaryItem}>
              <Text style={[styles.commentaryAuthor, { color: colors.primary }]}>
                {t.kuralDetailScreen.authorMV}
              </Text>
              <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                {kural.commentaryMV}
              </Text>
            </View>
          ) : null}

          {kural.commentarySP ? (
            <View style={[styles.commentaryItem, { borderTopColor: colors.borderLight, borderTopWidth: 1 }]}>
              <Text style={[styles.commentaryAuthor, { color: colors.accent }]}>
                {t.kuralDetailScreen.authorSP}
              </Text>
              <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                {kural.commentarySP}
              </Text>
            </View>
          ) : null}

          {kural.commentaryMK ? (
            <View style={[styles.commentaryItem, { borderTopColor: colors.borderLight, borderTopWidth: 1 }]}>
              <Text style={[styles.commentaryAuthor, { color: '#10B981' }]}>
                {t.kuralDetailScreen.authorMK}
              </Text>
              <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                {kural.commentaryMK}
              </Text>
            </View>
          ) : null}

          {kural.commentaryPRM ? (
            <View style={[styles.commentaryItem, { borderTopColor: colors.borderLight, borderTopWidth: 1 }]}>
              <Text style={[styles.commentaryAuthor, { color: isDark ? '#A78BFA' : '#7C3AED' }]}>
                {t.kuralDetailScreen.authorPRM}
              </Text>
              <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                {kural.commentaryPRM}
              </Text>
            </View>
          ) : null}

          {kural.commentaryMNK ? (
            <View style={[styles.commentaryItem, { borderTopColor: colors.borderLight, borderTopWidth: 1 }]}>
              <Text style={[styles.commentaryAuthor, { color: isDark ? '#38BDF8' : '#0284C7' }]}>
                {t.kuralDetailScreen.authorMNK}
              </Text>
              <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                {kural.commentaryMNK}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Structural Metadata */}
        <View style={[styles.detailSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionHeader, { color: colors.text }]}>{t.kuralDetailScreen.structureHeader}</Text>

          <View style={styles.metaGrid}>
            <View style={styles.metaCell}>
              <Text style={[styles.metaCellLabel, { color: colors.textMuted }]}>{t.kuralDetailScreen.categoryLabel}</Text>
              <Text style={[styles.metaCellValue, { color: colors.text }]}>
                {isEnglish
                  ? (kural.categoryTamil.includes('அறத்து')
                      ? 'Arathupaal'
                      : kural.categoryTamil.includes('பொருட்')
                      ? 'Porutpaal'
                      : 'Kaamathupaal')
                  : kural.categoryTamil}
              </Text>
              <Text style={[styles.metaCellSub, { color: colors.textSecondary }]}>
                {isEnglish ? kural.categoryTamil : kural.categoryEnglish}
              </Text>
            </View>

            <View style={styles.metaCell}>
              <Text style={[styles.metaCellLabel, { color: colors.textMuted }]}>{t.kuralDetailScreen.groupLabel}</Text>
              <Text style={[styles.metaCellValue, { color: colors.text }]}>
                {isEnglish ? kural.chapterGroupEnglish : kural.chapterGroupTamil}
              </Text>
              <Text style={[styles.metaCellSub, { color: colors.textSecondary }]}>
                {isEnglish ? kural.chapterGroupTamil : kural.chapterGroupEnglish}
              </Text>
            </View>

            <View style={styles.metaCell}>
              <Text style={[styles.metaCellLabel, { color: colors.textMuted }]}>{t.kuralDetailScreen.chapterLabel}</Text>
              <Text style={[styles.metaCellValue, { color: colors.text }]}>
                {isEnglish
                  ? kural.chapterTransliteration || kural.chapterNameEnglish
                  : kural.chapterNameTamil}
              </Text>
              <Text style={[styles.metaCellSub, { color: colors.textSecondary }]}>
                #{kural.chapterNumber} •{' '}
                {isEnglish
                  ? kural.chapterNameTamil
                  : kural.chapterTransliteration || kural.chapterNameEnglish}
              </Text>
            </View>

            <View style={styles.metaCell}>
              <Text style={[styles.metaCellLabel, { color: colors.textMuted }]}>{t.kuralDetailScreen.kuralNumberLabel}</Text>
              <Text style={[styles.metaCellValue, { color: colors.primary }]}>{kural.number}</Text>
              <Text style={[styles.metaCellSub, { color: colors.textSecondary }]}>{t.kuralDetailScreen.ofTotal}</Text>
            </View>
          </View>
        </View>

        {/* Prev / Next Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={[
              styles.navBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: kural.number > 1 ? 1 : 0.4,
              },
            ]}
            onPress={goToPrev}
            disabled={kural.number <= 1}
          >
            <Ionicons name="arrow-back" size={18} color={colors.primary} />
            <Text style={[styles.navBtnText, { color: colors.primary }]}>{t.kuralDetailScreen.prevKural}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: kural.number < 1330 ? 1 : 0.4,
              },
            ]}
            onPress={goToNext}
            disabled={kural.number >= 1330}
          >
            <Text style={[styles.navBtnText, { color: colors.primary }]}>{t.kuralDetailScreen.nextKural}</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AddToCollectionModal
        visible={showAddToCollection}
        onClose={() => setShowAddToCollection(false)}
        kural={kural}
      />

      <ExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        title={`குறள் ${kural.number} - ${kural.chapterNameTamil}`}
        kurals={[kural]}
      />

      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        kural={kural}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    padding: 6,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 12,
    alignSelf: 'center',
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  mainCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  kuralBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  chapterBadgeLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  chapterLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tamilTextContainer: {
    marginVertical: 6,
  },
  tamilLine: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: 0.2,
  },
  transliterationContainer: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  transliterationText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  actionsBar: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  actionChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionChipText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  copyActionsBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  copyChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  copyChipText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  detailSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
  },
  coupletBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
  },
  coupletLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  coupletText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  commentaryItem: {
    paddingVertical: 10,
  },
  commentaryAuthor: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  metaCell: {
    width: '48%',
    padding: 6,
  },
  metaCellLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metaCellValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  metaCellSub: {
    fontSize: 11.5,
    marginTop: 1,
  },
  navBar: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  navBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
});
