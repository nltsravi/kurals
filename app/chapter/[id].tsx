import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { KuralService } from '../../src/services/kuralService';
import { useTheme } from '../../src/context/ThemeContext';
import { useCollections } from '../../src/context/CollectionContext';
import { KuralCard } from '../../src/components/KuralCard';
import { ExportModal } from '../../src/components/ExportModal';
import { AddToCollectionModal } from '../../src/components/AddToCollectionModal';
import { Kural } from '../../src/types/kural';

export default function ChapterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { collections } = useCollections();

  const [showExportModal, setShowExportModal] = useState(false);
  const [modalKural, setModalKural] = useState<Kural | null>(null);

  const chapterNum = parseInt(id || '1', 10);
  const chapter = KuralService.getChapterByNumber(chapterNum);
  const kurals = KuralService.getKuralsByChapter(chapterNum);

  if (!chapter) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>அதிகாரம் கிடைக்கவில்லை</Text>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const goToPrev = () => {
    if (chapter.number > 1) {
      router.replace(`/chapter/${chapter.number - 1}`);
    }
  };

  const goToNext = () => {
    if (chapter.number < 133) {
      router.replace(`/chapter/${chapter.number + 1}`);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: `அதிகாரம் ${chapter.number}`,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setShowExportModal(true)}
              style={styles.headerExportBtn}
              accessibilityLabel="Export Chapter"
            >
              <Ionicons name="download-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <FlatList
          data={kurals}
          keyExtractor={(item) => String(item.number)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.badgeRow}>
                <View style={[styles.chBadge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.chBadgeText, { color: isDark ? '#FED7AA' : colors.primary }]}>
                    அதிகாரம் {chapter.number}
                  </Text>
                </View>
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {chapter.categoryTamil} • {chapter.groupTamil}
                </Text>
              </View>

              <Text style={[styles.chapterTitleTamil, { color: colors.text }]}>
                {chapter.nameTamil}
              </Text>

              <Text style={[styles.chapterTitleEnglish, { color: colors.textSecondary }]}>
                {chapter.nameEnglish} ({chapter.transliteration})
              </Text>

              <View style={[styles.footerMeta, { borderTopColor: colors.borderLight }]}>
                <Text style={[styles.rangeText, { color: colors.textMuted }]}>
                  குறள்கள் {chapter.startKural} முதல் {chapter.endKural} வரை (10 குறள்கள்)
                </Text>
                <TouchableOpacity
                  style={[styles.exportChip, { backgroundColor: isDark ? colors.surface : colors.primaryLight }]}
                  onPress={() => setShowExportModal(true)}
                >
                  <Ionicons name="share-outline" size={14} color={colors.primary} />
                  <Text style={[styles.exportChipText, { color: colors.primary }]}>Export Chapter</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const isSaved = collections.some((c) => c.kuralNumbers.includes(item.number));
            return (
              <KuralCard
                kural={item}
                onPress={() => router.push(`/kural/${item.number}`)}
                onAddToCollection={() => setModalKural(item)}
                isSaved={isSaved}
                showChapter={false}
              />
            );
          }}
          ListFooterComponent={
            <View style={styles.navBar}>
              <TouchableOpacity
                style={[
                  styles.navBtn,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    opacity: chapter.number > 1 ? 1 : 0.4,
                  },
                ]}
                onPress={goToPrev}
                disabled={chapter.number <= 1}
              >
                <Ionicons name="arrow-back" size={18} color={colors.primary} />
                <Text style={[styles.navBtnText, { color: colors.primary }]}>முந்தைய அதிகாரம்</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.navBtn,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    opacity: chapter.number < 133 ? 1 : 0.4,
                  },
                ]}
                onPress={goToNext}
                disabled={chapter.number >= 133}
              >
                <Text style={[styles.navBtnText, { color: colors.primary }]}>அடுத்த அதிகாரம்</Text>
                <Ionicons name="arrow-forward" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          }
        />

        <AddToCollectionModal
          visible={!!modalKural}
          onClose={() => setModalKural(null)}
          kural={modalKural}
        />

        <ExportModal
          visible={showExportModal}
          onClose={() => setShowExportModal(false)}
          title={`அதிகாரம் ${chapter.number} - ${chapter.nameTamil}`}
          kurals={kurals}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContent: {
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
  headerExportBtn: {
    padding: 6,
  },
  headerCard: {
    margin: 16,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  chBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chBadgeText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chapterTitleTamil: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  chapterTitleEnglish: {
    fontSize: 14,
    marginBottom: 14,
  },
  footerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  rangeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  exportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  exportChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  navBar: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 16,
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
    fontSize: 13,
    fontWeight: '700',
  },
});
