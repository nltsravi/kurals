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
import { useLanguage } from '../context/LanguageContext';
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
  const { isEnglish } = useLanguage();
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
      setTimeout(async () => {
        try {
          await ShareService.shareFile(fileUri, `${title}.${format}`);
        } catch (shareErr) {
          console.error('Share dialog error:', shareErr);
          Alert.alert(
            isEnglish ? 'Share Failed' : 'பகிர்வதில் பிழை',
            isEnglish
              ? 'Unable to open the share dialog. Please try again.'
              : 'பகிர்வு உரையாடலைத் திறக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'
          );
        }
      }, 250);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        isEnglish ? 'Export Failed' : 'ஏற்றுமதியில் பிழை',
        isEnglish
          ? 'Unable to create the document. Please try again.'
          : 'ஆவணத்தை உருவாக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'
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
              <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
                <View>
                  <Text style={[styles.title, { color: colors.text }]}>
                    {isEnglish ? 'Export & Share' : 'ஆவண ஏற்றுமதி & பகிர்வு'}
                  </Text>
                  <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {title} • {kurals.length}{' '}
                    {isEnglish
                      ? kurals.length === 1
                        ? 'Kural'
                        : 'Kurals'
                      : 'குறள்கள்'}
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
                    {isEnglish
                      ? `Generating ${exportFormat?.toUpperCase()} document...`
                      : `${exportFormat?.toUpperCase()} ஆவணம் உருவாக்கப்படுகிறது...`}
                  </Text>
                  <Text style={[styles.subLoadingText, { color: colors.textMuted }]}>
                    {isEnglish
                      ? 'Please wait while formatting text'
                      : 'தயவுசெய்து காத்திருக்கவும்'}
                  </Text>
                </View>
              ) : (
                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={[styles.formatOption, { borderColor: colors.border, backgroundColor: isDark ? colors.surface : colors.card }]}
                    onPress={() => handleExport('pdf')}
                    accessibilityRole="button"
                    accessibilityLabel={isEnglish ? 'Export as PDF' : 'PDF ஆக ஏற்றுமதி'}
                  >
                    <View style={[styles.formatIconCircle, { backgroundColor: '#FEE2E2' }]}>
                      <Ionicons name="document-text" size={26} color="#DC2626" />
                    </View>
                    <View style={styles.formatTextContainer}>
                      <Text style={[styles.formatName, { color: colors.text }]}>
                        {isEnglish ? 'PDF Document (.pdf)' : 'PDF ஆவணம் (.pdf)'}
                      </Text>
                      <Text style={[styles.formatDesc, { color: colors.textSecondary }]}>
                        {isEnglish
                          ? 'Best for printing, reading, and sharing with clean Tamil fonts'
                          : 'அச்சிட மற்றும் வாசிக்க உகந்தது'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.formatOption, { borderColor: colors.border, backgroundColor: isDark ? colors.surface : colors.card }]}
                    onPress={() => handleExport('docx')}
                    accessibilityRole="button"
                    accessibilityLabel={isEnglish ? 'Export as Word DOCX' : 'Word DOCX ஆக ஏற்றுமதி'}
                  >
                    <View style={[styles.formatIconCircle, { backgroundColor: '#DBEAFE' }]}>
                      <Ionicons name="document" size={26} color="#2563EB" />
                    </View>
                    <View style={styles.formatTextContainer}>
                      <Text style={[styles.formatName, { color: colors.text }]}>
                        {isEnglish ? 'Word Document (.docx)' : 'Word ஆவணம் (.docx)'}
                      </Text>
                      <Text style={[styles.formatDesc, { color: colors.textSecondary }]}>
                        {isEnglish
                          ? 'Editable Microsoft Word document formatted with structured kurals'
                          : 'திருத்தக்கூடிய மைக்ரோசாஃப்ட் வேர்ட் ஆவணம்'}
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
