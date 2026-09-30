import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Chapter } from '../types/kural';
import { useTheme } from '../context/ThemeContext';

interface ChapterCardProps {
  chapter: Chapter;
  onPress: () => void;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({ chapter, onPress }) => {
  const { colors, isDark } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`அதிகாரம் ${chapter.number}: ${chapter.nameTamil}`}
    >
      <View style={styles.contentRow}>
        <View style={[styles.numberBox, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.numberText, { color: isDark ? '#FED7AA' : colors.primary }]}>
            {chapter.number}
          </Text>
        </View>

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.nameTamil, { color: colors.text }]}>{chapter.nameTamil}</Text>
          </View>

          <Text style={[styles.nameEnglish, { color: colors.textSecondary }]} numberOfLines={1}>
            {chapter.nameEnglish}
          </Text>

          <View style={styles.metaRow}>
            <Text style={[styles.metaPill, { color: colors.textMuted }]}>
              {chapter.groupTamil} • குறள்கள் {chapter.startKural} - {chapter.endKural}
            </Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={styles.chevron} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    marginVertical: 5,
    marginHorizontal: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  numberText: {
    fontSize: 16,
    fontWeight: '700',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  nameTamil: {
    fontSize: 16,
    fontWeight: '600',
  },
  nameEnglish: {
    fontSize: 13,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaPill: {
    fontSize: 11.5,
  },
  chevron: {
    marginLeft: 6,
  },
});
