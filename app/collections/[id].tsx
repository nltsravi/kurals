import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCollections } from '../../src/context/CollectionContext';
import { useTheme } from '../../src/context/ThemeContext';
import { KuralService } from '../../src/services/kuralService';
import { ExportModal } from '../../src/components/ExportModal';
import { ShareModal } from '../../src/components/ShareModal';
import { EmptyState } from '../../src/components/EmptyState';
import { Kural } from '../../src/types/kural';
import { KuralCoupletText } from '../../src/components/KuralCoupletText';

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { collections, updateCollection, deleteCollection, removeKuralFromCollection, moveKural } =
    useCollections();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [shareKural, setShareKural] = useState<Kural | null>(null);

  const collection = collections.find((c) => c.id === id);

  if (!collection) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>தொகுப்பு கிடைக்கவில்லை</Text>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backBtnText}>Back to Collections</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const kurals = KuralService.getKuralsByNumbers(collection.kuralNumbers);

  const handleSaveTitle = async () => {
    if (!editedTitle.trim()) return;
    await updateCollection(collection.id, { name: editedTitle.trim() });
    setIsEditingTitle(false);
  };

  const handleDeleteCollection = () => {
    Alert.alert(
      'Delete Collection',
      `Are you sure you want to delete "${collection.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCollection(collection.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleRemoveKural = (kuralNumber: number) => {
    Alert.alert(
      'Remove Kural',
      `Remove குறள் ${kuralNumber} from "${collection.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeKuralFromCollection(collection.id, kuralNumber);
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: collection.name,
          headerRight: () => (
            <View style={styles.headerRightActions}>
              <TouchableOpacity
                onPress={() => setShowExportModal(true)}
                style={styles.headerBtn}
                accessibilityLabel="Export Collection"
              >
                <Ionicons name="download-outline" size={22} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteCollection}
                style={styles.headerBtn}
                accessibilityLabel="Delete Collection"
              >
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
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
              {isEditingTitle ? (
                <View style={styles.editRow}>
                  <TextInput
                    style={[
                      styles.titleInput,
                      {
                        backgroundColor: colors.surface,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    value={editedTitle}
                    onChangeText={setEditedTitle}
                    autoFocus
                  />
                  <TouchableOpacity
                    style={[styles.saveTitleBtn, { backgroundColor: colors.primary }]}
                    onPress={handleSaveTitle}
                  >
                    <Text style={styles.saveTitleText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setIsEditingTitle(false)}
                    style={styles.cancelTitleBtn}
                  >
                    <Ionicons name="close" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.titleRow}>
                  <Text style={[styles.collectionTitle, { color: colors.text }]}>
                    {collection.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setEditedTitle(collection.name);
                      setIsEditingTitle(true);
                    }}
                    style={styles.renameBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="pencil" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}

              {collection.description ? (
                <Text style={[styles.collectionDesc, { color: colors.textSecondary }]}>
                  {collection.description}
                </Text>
              ) : null}

              <View style={[styles.metaBar, { borderTopColor: colors.borderLight }]}>
                <Text style={[styles.metaText, { color: colors.textMuted }]}>
                  {kurals.length} {kurals.length === 1 ? 'Kural' : 'Kurals'} •{' '}
                  {kurals.length} குறள்கள்
                </Text>
                {kurals.length > 0 && (
                  <TouchableOpacity
                    style={[styles.exportChip, { backgroundColor: isDark ? colors.surface : colors.primaryLight }]}
                    onPress={() => setShowExportModal(true)}
                  >
                    <Ionicons name="share-outline" size={14} color={colors.primary} />
                    <Text style={[styles.exportChipText, { color: colors.primary }]}>Export</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          }
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.itemCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <TouchableOpacity
                style={styles.cardMainTap}
                onPress={() => router.push(`/kural/${item.number}`)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.kuralNumBadge, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.kuralNumText, { color: isDark ? '#FED7AA' : colors.primary }]}>
                      குறள் {item.number}
                    </Text>
                  </View>
                  <Text style={[styles.cardChapter, { color: colors.textSecondary }]}>
                    {item.chapterNameTamil}
                  </Text>
                </View>

                <KuralCoupletText
                  line1={item.line1}
                  line2={item.line2}
                  tamil={item.tamil}
                  color={colors.text}
                  baseFontSize={16}
                  fontWeight="600"
                  containerStyle={{ marginVertical: 4 }}
                />

                {item.transliteration ? (
                  <Text style={[styles.translitText, { color: colors.textSecondary }]}>
                    {item.transliteration}
                  </Text>
                ) : null}
              </TouchableOpacity>

              {/* Reordering and Removal Controls (Section 40) */}
              <View style={[styles.reorderBar, { borderTopColor: colors.borderLight }]}>
                <View style={styles.reorderArrows}>
                  <TouchableOpacity
                    onPress={() => moveKural(collection.id, item.number, 'up')}
                    disabled={index === 0}
                    style={[styles.arrowBtn, { opacity: index === 0 ? 0.3 : 1 }]}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Move Kural up"
                  >
                    <Ionicons name="arrow-up" size={16} color={colors.text} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => moveKural(collection.id, item.number, 'down')}
                    disabled={index === kurals.length - 1}
                    style={[styles.arrowBtn, { opacity: index === kurals.length - 1 ? 0.3 : 1 }]}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Move Kural down"
                  >
                    <Ionicons name="arrow-down" size={16} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    onPress={() => setShareKural(item)}
                    style={styles.shareBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Share Kural"
                  >
                    <Ionicons name="share-social-outline" size={16} color={colors.primary} />
                    <Text style={[styles.shareText, { color: colors.primary }]}>Share</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleRemoveKural(item.number)}
                    style={styles.removeBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Remove from collection"
                  >
                    <Ionicons name="close-circle-outline" size={16} color={colors.danger} />
                    <Text style={[styles.removeText, { color: colors.danger }]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="book-outline"
              title="No Kurals in this collection"
              description="Browse chapters or search to find Kurals and add them here."
              actionLabel="Search Kurals"
              onAction={() => router.push('/search')}
            />
          }
        />

        <ExportModal
          visible={showExportModal}
          onClose={() => setShowExportModal(false)}
          title={collection.name}
          kurals={kurals}
        />

        <ShareModal
          visible={!!shareKural}
          onClose={() => setShareKural(null)}
          kural={shareKural}
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
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  collectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    flex: 1,
  },
  renameBtn: {
    padding: 6,
  },
  collectionDesc: {
    fontSize: 13.5,
    marginTop: 6,
    lineHeight: 18,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleInput: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '700',
  },
  saveTitleBtn: {
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveTitleText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  cancelTitleBtn: {
    padding: 6,
  },
  metaBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  metaText: {
    fontSize: 12.5,
    fontWeight: '600',
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
  itemCard: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardMainTap: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kuralNumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  kuralNumText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardChapter: {
    fontSize: 12,
    fontWeight: '600',
  },
  tamilLine: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  translitText: {
    marginTop: 8,
    fontSize: 12.5,
    fontStyle: 'italic',
    lineHeight: 17,
  },
  reorderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  reorderArrows: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  arrowBtn: {
    padding: 6,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
  },
  shareText: {
    fontSize: 12,
    fontWeight: '600',
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
  },
  removeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
