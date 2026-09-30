import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCollections } from '../../src/context/CollectionContext';
import { useTheme } from '../../src/context/ThemeContext';

const COLOR_OPTIONS = [
  '#0284C7', // Sky Blue
  '#E11D48', // Rose / Red
  '#D97706', // Amber / Gold
  '#10B981', // Emerald Green
  '#7C3AED', // Purple
  '#EA580C', // Orange
];

export default function CreateCollectionScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { createCollection } = useCollections();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      setIsSubmitting(true);
      await createCollection(name.trim(), description.trim(), 'bookmark', selectedColor);
      router.back();
    } catch (err) {
      console.error('Failed to create collection:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.text }]}>Collection Name (பெயர்)</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? colors.surface : '#FFFFFF',
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. My Favorite Kurals, Exam Prep"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />

            <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>
              Description (விளக்கம் - Optional)
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: isDark ? colors.surface : '#FFFFFF',
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Brief note about this collection"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
            />

            <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>
              Accent Color (வண்ணம்)
            </Text>
            <View style={styles.colorRow}>
              {COLOR_OPTIONS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: c },
                    selectedColor === c && styles.selectedColorCircle,
                  ]}
                  onPress={() => setSelectedColor(c)}
                  accessibilityRole="button"
                  accessibilityLabel={`Color ${c}`}
                >
                  {selectedColor === c && (
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.saveBtn,
                {
                  backgroundColor: name.trim() ? colors.primary : colors.border,
                  opacity: isSubmitting ? 0.6 : 1,
                },
              ]}
              onPress={handleSave}
              disabled={!name.trim() || isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Create Collection"
            >
              <Text style={styles.saveBtnText}>Create Collection</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  formCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  textArea: {
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 10,
  },
  colorCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedColorCircle: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  saveBtn: {
    marginTop: 24,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
