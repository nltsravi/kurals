import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { KuralService } from '../../src/services/kuralService';
import { Category, Chapter } from '../../src/types/kural';
import { ChapterCard } from '../../src/components/ChapterCard';
import { useTheme } from '../../src/context/ThemeContext';

export default function ChaptersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryNumber?: string }>();
  const { colors, isDark } = useTheme();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryNum, setSelectedCategoryNum] = useState<number>(1);

  useEffect(() => {
    const cats = KuralService.getAllCategories();
    setCategories(cats);
    if (params.categoryNumber) {
      const num = parseInt(params.categoryNumber, 10);
      if (!isNaN(num) && num >= 1 && num <= 3) {
        setSelectedCategoryNum(num);
      }
    }
  }, [params.categoryNumber]);

  const activeCategory = categories.find((c) => c.number === selectedCategoryNum) || categories[0];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Category Pills Header */}
      <View style={[styles.pillsContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {categories.map((cat) => {
          const isSelected = cat.number === selectedCategoryNum;
          return (
            <TouchableOpacity
              key={cat.number}
              style={[
                styles.categoryPill,
                {
                  backgroundColor: isSelected
                    ? colors.primary
                    : isDark
                    ? colors.surface
                    : colors.borderLight,
                },
              ]}
              onPress={() => setSelectedCategoryNum(cat.number)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${cat.nameTamil} category`}
            >
              <Text
                style={[
                  styles.pillTamil,
                  { color: isSelected ? '#FFFFFF' : colors.text },
                ]}
              >
                {cat.nameTamil}
              </Text>
              <Text
                style={[
                  styles.pillEnglish,
                  { color: isSelected ? 'rgba(255,255,255,0.85)' : colors.textMuted },
                ]}
              >
                {cat.nameEnglish} ({cat.chapters.length})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Chapters List */}
      {activeCategory && (
        <FlatList
          data={activeCategory.chapterGroups}
          keyExtractor={(group) => `${activeCategory.number}_${group.number}_${group.nameTamil}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: group }) => (
            <View style={styles.groupSection}>
              <View style={[styles.groupHeaderRow, { backgroundColor: colors.surface }]}>
                <View>
                  <Text style={[styles.groupNameTamil, { color: colors.text }]}>
                    இயல் {group.number}: {group.nameTamil}
                  </Text>
                  <Text style={[styles.groupNameEnglish, { color: colors.textSecondary }]}>
                    {group.nameEnglish} ({group.chapters.length} அதிகாரங்கள்)
                  </Text>
                </View>
              </View>

              {group.chapters.map((ch) => (
                <ChapterCard
                  key={ch.number}
                  chapter={ch}
                  onPress={() => router.push(`/chapter/${ch.number}`)}
                />
              ))}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  pillsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
  },
  categoryPill: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillTamil: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  pillEnglish: {
    fontSize: 10.5,
    marginTop: 2,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 30,
  },
  groupSection: {
    marginTop: 12,
  },
  groupHeaderRow: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: 6,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  groupNameTamil: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  groupNameEnglish: {
    fontSize: 12,
    marginTop: 1,
  },
});
