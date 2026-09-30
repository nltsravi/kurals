import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCollections } from '../../src/context/CollectionContext';
import { useTheme } from '../../src/context/ThemeContext';
import { CollectionCard } from '../../src/components/CollectionCard';
import { EmptyState } from '../../src/components/EmptyState';
import { ExportModal } from '../../src/components/ExportModal';
import { KuralService } from '../../src/services/kuralService';
import { Collection, Kural } from '../../src/types/kural';

export default function CollectionsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { collections, deleteCollection } = useCollections();

  const [exportCollection, setExportCollection] = useState<{
    name: string;
    kurals: Kural[];
  } | null>(null);

  const handleDelete = (collection: Collection) => {
    Alert.alert(
      'Delete Collection',
      `Are you sure you want to delete "${collection.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
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
        'Empty Collection',
        'Add some Kurals to this collection before exporting.'
      );
      return;
    }
    setExportCollection({
      name: collection.name,
      kurals,
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>என் தொகுப்புகள்</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            My Collections ({collections.length})
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/collections/create')}
          accessibilityRole="button"
          accessibilityLabel="Create Collection"
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.createBtnText}>New</Text>
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
            title="No collections yet"
            description="Create your first collection to organize and save your favorite Thirukkurals."
            actionLabel="+ Create Collection"
            onAction={() => router.push('/collections/create')}
          />
        }
      />

      <ExportModal
        visible={!!exportCollection}
        onClose={() => setExportCollection(null)}
        title={exportCollection?.name || 'Collection'}
        kurals={exportCollection?.kurals || []}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
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
