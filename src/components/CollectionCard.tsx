import React from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Collection } from '../types/kural';
import { useTheme } from '../context/ThemeContext';

interface CollectionCardProps {
  collection: Collection;
  onPress: () => void;
  onExport?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  onPress,
  onExport,
  onDelete,
  onEdit,
}) => {
  const { colors, isDark } = useTheme();
  const accentColor = collection.color || colors.primary;

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
      accessibilityLabel={`Collection ${collection.name}, ${collection.kuralNumbers.length} Kurals`}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconCircle, { backgroundColor: `${accentColor}1A` }]}>
          <Ionicons name="folder-outline" size={22} color={accentColor} />
        </View>

        <View style={styles.headerInfo}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {collection.name}
          </Text>
          <Text style={[styles.countText, { color: colors.textSecondary }]}>
            {collection.kuralNumbers.length}{' '}
            {collection.kuralNumbers.length === 1 ? 'Kural' : 'Kurals'} •{' '}
            {collection.kuralNumbers.length} குறள்கள்
          </Text>
        </View>

        <View style={styles.actionsRow}>
          {onEdit && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              style={styles.actionBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Edit collection"
            >
              <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}

          {onExport && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onExport();
              }}
              style={styles.actionBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Export collection"
            >
              <Ionicons name="share-outline" size={19} color={colors.primary} />
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              style={styles.actionBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Delete collection"
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {collection.description ? (
        <Text style={[styles.description, { color: colors.textMuted }]} numberOfLines={2}>
          {collection.description}
        </Text>
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
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  countText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
  },
  description: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
  },
});
