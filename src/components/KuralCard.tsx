import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Kural } from '../types/kural';
import { useTheme } from '../context/ThemeContext';

interface KuralCardProps {
  kural: Kural;
  onPress: () => void;
  onAddToCollection?: () => void;
  isSaved?: boolean;
  showTransliteration?: boolean;
  showChapter?: boolean;
}

export const KuralCard: React.FC<KuralCardProps> = ({
  kural,
  onPress,
  onAddToCollection,
  isSaved = false,
  showTransliteration = true,
  showChapter = true,
}) => {
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
      accessibilityLabel={`குறள் ${kural.number}, ${kural.line1} ${kural.line2}`}
    >
      <View style={styles.topRow}>
        <View style={[styles.numberBadge, { backgroundColor: isDark ? '#0369A1' : colors.primaryLight }]}>
          <Text style={[styles.numberText, { color: isDark ? '#BAE6FD' : colors.primary }]}>
            குறள் {kural.number}
          </Text>
        </View>

        {showChapter && (
          <Text style={[styles.chapterText, { color: colors.textSecondary }]} numberOfLines={1}>
            {kural.chapterNameTamil}
          </Text>
        )}

        {onAddToCollection && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onAddToCollection();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel={isSaved ? 'In collection' : 'Add to collection'}
            style={styles.bookmarkButton}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isSaved ? colors.accent : colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tamilContainer}>
        <Text style={[styles.tamilLine, { color: colors.text }]}>{kural.line1}</Text>
        <Text style={[styles.tamilLine, { color: colors.text }]}>{kural.line2}</Text>
      </View>

      {showTransliteration && kural.transliteration ? (
        <View style={[styles.transliterationContainer, { borderTopColor: colors.borderLight }]}>
          <Text style={[styles.transliterationText, { color: colors.textSecondary }]}>
            {kural.transliteration}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  numberBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  numberText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  chapterText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    marginLeft: 10,
    marginRight: 6,
  },
  bookmarkButton: {
    padding: 4,
  },
  tamilContainer: {
    marginVertical: 4,
  },
  tamilLine: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 25,
    letterSpacing: 0.2,
  },
  transliterationContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  transliterationText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
