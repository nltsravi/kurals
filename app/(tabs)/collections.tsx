import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCollections } from '../../src/context/CollectionContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { CollectionCard } from '../../src/components/CollectionCard';
import { EmptyState } from '../../src/components/EmptyState';
import { ExportModal } from '../../src/components/ExportModal';
import { KuralService } from '../../src/services/kuralService';
import { Collection, Kural } from '../../src/types/kural';

export default function CollectionsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { t, isEnglish } = useLanguage();
  const { collections, deleteCollection } = useCollections();

  const [exportCollection, setExportCollection] = useState<{
    name: string;
    kurals: Kural[];
  } | null>(null);

  const handleDelete = (collection: Collection) => {
    Alert.alert(
      t.collectionsScreen.deleteTitle,
      isEnglish
        ? `Are you sure you want to delete "${collection.name}"? This cannot be undone.`
        : `இந்தத் தொகுப்பை நீக்க விரும்புகிறீர்களா? ("${collection.name}")`,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: async () => {
            await deleteCollection(collection.id);
          },
        },
      ]
    );
  };

  const handleExport = (collection: Collection) => {
    const kurals = KuralService.getKuralsByNumbers(collection.kuralNumbers);
    if (kurals.length === 0) {
      Alert.alert(
        t.collectionsScreen.emptyCollectionTitle,
        t.collectionsScreen.emptyCollectionDesc
      );
      return;
    }
    setExportCollection({
      name: collection.name,
      kurals,
    });
  };

  return (
    <SafeAreaView edges={[]} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t.collectionsScreen.title}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {isEnglish ? `Collections (${collections.length})` : `தொகுப்புகள் (${collections.length})`}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/collections/create')}
          accessibilityRole="button"
          accessibilityLabel={t.collectionsScreen.newBtn}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.createBtnText}>{t.collectionsScreen.newBtn}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={collections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CollectionCard
            collection={item}
            onPress={() => router.push(`/collections/${item.id}`)}
            onExport={() => handleExport(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="bookmark-outline"
            title={t.collectionsScreen.emptyTitle}
            description={t.collectionsScreen.emptyDesc}
            actionLabel={isEnglish ? '+ Create Collection' : '+ புதிய தொகுப்பு'}
            onAction={() => router.push('/collections/create')}
          />
        }
      />

      <ExportModal
        visible={!!exportCollection}
        onClose={() => setExportCollection(null)}
        title={exportCollection?.name || (isEnglish ? 'Collection' : 'தொகுப்பு')}
        kurals={exportCollection?.kurals || []}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13.5,
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 30,
  },
});
