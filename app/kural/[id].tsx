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
import { useCollections } from '../../src/context/CollectionContext';
import { AddToCollectionModal } from '../../src/components/AddToCollectionModal';
import { ExportModal } from '../../src/components/ExportModal';
import { ShareModal } from '../../src/components/ShareModal';
import { formatKuralText } from '../../src/utils/text';
import { KuralCoupletText } from '../../src/components/KuralCoupletText';

export default function KuralDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { collections } = useCollections();

  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);

  const kuralNumber = parseInt(id || '1', 10);
  const kural = KuralService.getKuralByNumber(kuralNumber);

  if (!kural) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>குறள் கிடைக்கவில்லை</Text>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backBtnText}>Back to safety</Text>
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
    showNotice('Tamil text copied!');
  };

  const handleCopyTransliteration = async () => {
    const text = formatKuralText(kural, 'transliteration');
    await ShareService.copyToClipboard(text);
    showNotice('Transliteration copied!');
  };

  const handleCopyBoth = async () => {
    const text = formatKuralText(kural, 'both');
    await ShareService.copyToClipboard(text);
    showNotice('Tamil & Transliteration copied!');
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
          title: `குறள் ${kural.number}`,
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
                குறள் {kural.number}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/chapter/${kural.chapterNumber}`)}
              style={styles.chapterBadgeLink}
            >
              <Text style={[styles.chapterLinkText, { color: colors.textSecondary }]}>
                {kural.chapterNameTamil} →
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
                English Transliteration
              </Text>
              <Text style={[styles.transliterationText, { color: colors.textSecondary }]}>
                {kural.transliteration}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Quick Copy / Share / Export Action Bar */}
        <View style={styles.actionsBar}>
          <TouchableOpacity
            style={[styles.actionChip, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
            onPress={() => setShowShareModal(true)}
          >
            <Ionicons name="share-social-outline" size={14} color={colors.primary} />
            <Text style={[styles.actionChipText, { color: colors.primary, fontWeight: '700' }]} numberOfLines={1}>
              Share
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionChip, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleCopyTamil}
          >
            <Ionicons name="copy-outline" size={14} color={colors.primary} />
            <Text style={[styles.actionChipText, { color: colors.text }]} numberOfLines={1}>Copy Tamil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionChip, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleCopyTransliteration}
          >
            <Ionicons name="copy-outline" size={14} color={colors.primary} />
            <Text style={[styles.actionChipText, { color: colors.text }]} numberOfLines={1}>Translit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionChip, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleCopyBoth}
          >
            <Ionicons name="copy-outline" size={14} color={colors.primary} />
            <Text style={[styles.actionChipText, { color: colors.text }]} numberOfLines={1}>Both</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionChip, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowExportModal(true)}
          >
            <Ionicons name="download-outline" size={14} color={colors.accent} />
            <Text style={[styles.actionChipText, { color: colors.text }]} numberOfLines={1}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* English Translation */}
        {kural.translation ? (
          <View style={[styles.detailSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionHeader, { color: colors.text }]}>English Translation</Text>
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

        {/* Commentaries (உரைகள்) */}
        <View style={[styles.detailSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionHeader, { color: colors.text }]}>உரைகள் (Commentaries)</Text>

          {kural.commentaryMV ? (
            <View style={styles.commentaryItem}>
              <Text style={[styles.commentaryAuthor, { color: colors.primary }]}>
                மு. வரதராசனார் உரை
              </Text>
              <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                {kural.commentaryMV}
              </Text>
            </View>
          ) : null}

          {kural.commentarySP ? (
            <View style={[styles.commentaryItem, { borderTopColor: colors.borderLight, borderTopWidth: 1 }]}>
              <Text style={[styles.commentaryAuthor, { color: colors.accent }]}>
                சாலமன் பாப்பையா உரை
              </Text>
              <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                {kural.commentarySP}
              </Text>
            </View>
          ) : null}

          {kural.commentaryMK ? (
            <View style={[styles.commentaryItem, { borderTopColor: colors.borderLight, borderTopWidth: 1 }]}>
              <Text style={[styles.commentaryAuthor, { color: '#10B981' }]}>
                கலைஞர் மு. கருணாநிதி உரை
              </Text>
              <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                {kural.commentaryMK}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Structural Metadata */}
        <View style={[styles.detailSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionHeader, { color: colors.text }]}>அமைப்பு விவரங்கள் (Structure)</Text>

          <View style={styles.metaGrid}>
            <View style={styles.metaCell}>
              <Text style={[styles.metaCellLabel, { color: colors.textMuted }]}>பால் (Category)</Text>
              <Text style={[styles.metaCellValue, { color: colors.text }]}>{kural.categoryTamil}</Text>
              <Text style={[styles.metaCellSub, { color: colors.textSecondary }]}>{kural.categoryEnglish}</Text>
            </View>

            <View style={styles.metaCell}>
              <Text style={[styles.metaCellLabel, { color: colors.textMuted }]}>இயல் (Group)</Text>
              <Text style={[styles.metaCellValue, { color: colors.text }]}>{kural.chapterGroupTamil}</Text>
              <Text style={[styles.metaCellSub, { color: colors.textSecondary }]}>{kural.chapterGroupEnglish}</Text>
            </View>

            <View style={styles.metaCell}>
              <Text style={[styles.metaCellLabel, { color: colors.textMuted }]}>அதிகாரம் (Chapter)</Text>
              <Text style={[styles.metaCellValue, { color: colors.text }]}>{kural.chapterNameTamil}</Text>
              <Text style={[styles.metaCellSub, { color: colors.textSecondary }]}>
                #{kural.chapterNumber} • {kural.chapterNameEnglish}
              </Text>
            </View>

            <View style={styles.metaCell}>
              <Text style={[styles.metaCellLabel, { color: colors.textMuted }]}>குறள் எண்</Text>
              <Text style={[styles.metaCellValue, { color: colors.primary }]}>{kural.number}</Text>
              <Text style={[styles.metaCellSub, { color: colors.textSecondary }]}>of 1330</Text>
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
            <Text style={[styles.navBtnText, { color: colors.primary }]}>முந்தைய குறள்</Text>
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
            <Text style={[styles.navBtnText, { color: colors.primary }]}>அடுத்த குறள்</Text>
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
    gap: 8,
    marginBottom: 14,
  },
  actionChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionChipText: {
    fontSize: 12,
    fontWeight: '600',
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
    gap: 10,
  },
  metaCell: {
    width: '48%',
    padding: 10,
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
