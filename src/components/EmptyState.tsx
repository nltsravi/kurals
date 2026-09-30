import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  suggestions?: string[];
  onSuggestionPress?: (suggestion: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'document-text-outline',
  title,
  description,
  actionLabel,
  onAction,
  suggestions,
  onSuggestionPress,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: isDark ? '#1E293B' : colors.primaryLight },
        ]}
      >
        <Ionicons name={icon} size={40} color={isDark ? '#38BDF8' : colors.primary} />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      {description ? (
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {description}
        </Text>
      ) : null}

      {suggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={[styles.suggestionsHeader, { color: colors.textMuted }]}>
            Try searching for:
          </Text>
          <View style={styles.chipsRow}>
            {suggestions.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => onSuggestionPress?.(item)}
              >
                <Text style={[styles.chipText, { color: colors.primary }]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 48,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 300,
  },
  suggestionsContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  suggestionsHeader: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionButton: {
    marginTop: 24,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
