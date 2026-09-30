import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCollections } from '../context/CollectionContext';
import { useTheme } from '../context/ThemeContext';
import { Kural } from '../types/kural';

interface AddToCollectionModalProps {
  visible: boolean;
  onClose: () => void;
  kural: Kural | null;
}

export const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({
  visible,
  onClose,
  kural,
}) => {
  const { colors, isDark } = useTheme();
  const { collections, addKuralToCollection, removeKuralFromCollection, createCollection } =
    useCollections();
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!kural) return null;

  const handleToggle = async (collectionId: string, isIn: boolean) => {
    if (isIn) {
      await removeKuralFromCollection(collectionId, kural.number);
    } else {
      await addKuralToCollection(collectionId, kural.number);
    }
  };

  const handleCreateNew = async () => {
    if (!newCollectionName.trim()) return;
    const created = await createCollection(newCollectionName.trim());
    await addKuralToCollection(created.id, kural.number);
    setNewCollectionName('');
    setIsCreating(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.header}>
                <View>
                  <Text style={[styles.title, { color: colors.text }]}>Add to Collection</Text>
                  <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    குறள் {kural.number}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={collections}
                keyExtractor={(item) => item.id}
                style={styles.list}
                renderItem={({ item }) => {
                  const isIn = item.kuralNumbers.includes(kural.number);
                  return (
                    <TouchableOpacity
                      style={[
                        styles.collectionItem,
                        { borderColor: colors.borderLight, backgroundColor: isIn ? (isDark ? '#082F49' : colors.primaryLight) : 'transparent' },
                      ]}
                      onPress={() => handleToggle(item.id, isIn)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isIn }}
                      accessibilityLabel={`${item.name}, ${isIn ? 'Selected' : 'Not selected'}`}
                    >
                      <Ionicons
                        name={isIn ? 'checkbox' : 'square-outline'}
                        size={22}
                        color={isIn ? colors.primary : colors.textMuted}
                        style={styles.checkIcon}
                      />
                      <View style={styles.itemTextContainer}>
                        <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                        <Text style={[styles.itemCount, { color: colors.textSecondary }]}>
                          {item.kuralNumbers.length} Kurals
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    No collections yet. Create your first collection below!
                  </Text>
                }
              />

              {isCreating ? (
                <View style={styles.createRow}>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark ? colors.surface : '#FFFFFF',
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    value={newCollectionName}
                    onChangeText={setNewCollectionName}
                    placeholder="Collection name (e.g. My Favorites)"
                    placeholderTextColor={colors.textMuted}
                    autoFocus
                  />
                  <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                    onPress={handleCreateNew}
                  >
                    <Text style={styles.saveBtnText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => {
                      setIsCreating(false);
                      setNewCollectionName('');
                    }}
                  >
                    <Ionicons name="close" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.newCollectionBtn, { borderColor: colors.border }]}
                  onPress={() => setIsCreating(true)}
                >
                  <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                  <Text style={[styles.newCollectionText, { color: colors.primary }]}>
                    Create New Collection
                  </Text>
                </TouchableOpacity>
              )}
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
  },
  list: {
    maxHeight: 260,
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
    borderWidth: 1,
  },
  checkIcon: {
    marginRight: 12,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemCount: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 14,
  },
  newCollectionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 14,
    gap: 8,
  },
  newCollectionText: {
    fontSize: 14.5,
    fontWeight: '600',
  },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  saveBtn: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  cancelBtn: {
    padding: 8,
  },
});
