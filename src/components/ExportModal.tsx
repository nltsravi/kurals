import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Kural } from '../types/kural';
import { ExportService } from '../services/exportService';
import { ShareService } from '../services/shareService';

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  kurals: Kural[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  visible,
  onClose,
  title,
  kurals,
}) => {
  const { colors, isDark } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx' | null>(null);

  const handleExport = async (format: 'pdf' | 'docx') => {
    try {
      setIsExporting(true);
      setExportFormat(format);

      let fileUri = '';
      if (format === 'pdf') {
        fileUri = await ExportService.exportToPdf(title, kurals);
      } else {
        fileUri = await ExportService.exportToDocx(title, kurals);
      }

      onClose();
      await ShareService.shareFile(fileUri, `${title}.${format}`);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        'Export Failed',
        'Unable to create the document. Please try again.'
      );
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.header}>
                <View>
                  <Text style={[styles.title, { color: colors.text }]}>Export & Share</Text>
                  <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {title} • {kurals.length} {kurals.length === 1 ? 'Kural' : 'Kurals'}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} disabled={isExporting}>
                  <Ionicons name="close" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {isExporting ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.text }]}>
                    Generating {exportFormat?.toUpperCase()} document...
                  </Text>
                  <Text style={[styles.subLoadingText, { color: colors.textMuted }]}>
                    Please wait while formatting Tamil text
                  </Text>
                </View>
              ) : (
                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={[styles.formatOption, { borderColor: colors.border, backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}
                    onPress={() => handleExport('pdf')}
                    accessibilityRole="button"
                    accessibilityLabel="Export as PDF"
                  >
                    <View style={[styles.formatIconCircle, { backgroundColor: '#FEE2E2' }]}>
                      <Ionicons name="document-text" size={26} color="#DC2626" />
                    </View>
                    <View style={styles.formatTextContainer}>
                      <Text style={[styles.formatName, { color: colors.text }]}>PDF Document (.pdf)</Text>
                      <Text style={[styles.formatDesc, { color: colors.textSecondary }]}>
                        Best for printing, reading, and sharing with clean Tamil fonts
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.formatOption, { borderColor: colors.border, backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}
                    onPress={() => handleExport('docx')}
                    accessibilityRole="button"
                    accessibilityLabel="Export as Word DOCX"
                  >
                    <View style={[styles.formatIconCircle, { backgroundColor: '#DBEAFE' }]}>
                      <Ionicons name="document" size={26} color="#2563EB" />
                    </View>
                    <View style={styles.formatTextContainer}>
                      <Text style={[styles.formatName, { color: colors.text }]}>Word Document (.docx)</Text>
                      <Text style={[styles.formatDesc, { color: colors.textSecondary }]}>
                        Editable Microsoft Word document formatted with structured kurals
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
        </Pressable>
      </Pressable>
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
    padding: 22,
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
    fontWeight: '500',
  },
  closeBtn: {
    padding: 6,
  },
  optionsContainer: {
    gap: 12,
    marginTop: 6,
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  formatIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  formatTextContainer: {
    flex: 1,
  },
  formatName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  formatDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  subLoadingText: {
    fontSize: 13,
    marginTop: 6,
  },
});
