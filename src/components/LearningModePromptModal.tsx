import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useLearningMode } from '../context/LearningModeContext';

export const LearningModePromptModal: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const {
    showLaunchPromptModal,
    isDownloading,
    downloadProgress,
    downloadError,
    enableLearningMode,
    dismissLaunchPromptForLater,
  } = useLearningMode();

  if (!showLaunchPromptModal) {
    return null;
  }

  return (
    <Modal
      visible={showLaunchPromptModal}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!isDownloading) {
          dismissLaunchPromptForLater();
        }
      }}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header Icon & Title */}
          <View style={styles.headerRow}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="mic-outline" size={26} color={colors.primary} />
            </View>
            <View style={styles.headerTextCol}>
              <Text style={[styles.title, { color: colors.text }]}>
                {t.learningModePrompt.title}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {t.learningModePrompt.subtitle}
              </Text>
            </View>
          </View>

          {/* Tamil-Only Artifact Badge */}
          <View
            style={[
              styles.tamilOnlyBadge,
              {
                backgroundColor: isDark ? '#143321' : '#DCFCE7',
                borderColor: isDark ? '#22C55E' : '#86EFAC',
              },
            ]}
          >
            <Ionicons name="shield-checkmark" size={16} color="#16A34A" />
            <Text style={[styles.tamilOnlyBadgeText, { color: isDark ? '#86EFAC' : '#166534' }]}>
              {t.learningModePrompt.tamilOnlyBadge}
            </Text>
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: colors.text }]}>
            {t.learningModePrompt.description}
          </Text>

          {/* Network Requirement Notice */}
          <View
            style={[
              styles.networkNoticeBox,
              {
                backgroundColor: isDark ? colors.surface : '#FFFBEB',
                borderColor: isDark ? colors.border : '#FDE68A',
              },
            ]}
          >
            <View style={styles.networkTitleRow}>
              <Ionicons name="wifi-outline" size={18} color={colors.accent} />
              <Text style={[styles.networkTitle, { color: colors.text }]}>
                {t.learningModePrompt.networkNoticeTitle}
              </Text>
            </View>
            <Text style={[styles.networkBody, { color: colors.textSecondary }]}>
              {t.learningModePrompt.networkNoticeBody}
            </Text>
          </View>

          {/* Download Progress State */}
          {isDownloading && downloadProgress ? (
            <View style={[styles.progressContainer, { backgroundColor: colors.surface }]}>
              <View style={styles.progressHeader}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.progressTitle, { color: colors.text }]}>
                  {t.learningModePrompt.downloadingTitle}
                </Text>
              </View>
              <View style={[styles.progressBarTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      backgroundColor: colors.primary,
                      width: `${Math.max(8, downloadProgress.percentage)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressArtifactText, { color: colors.textSecondary }]} numberOfLines={1}>
                {downloadProgress.currentArtifact} ({downloadProgress.percentage}%)
              </Text>
            </View>
          ) : null}

          {/* Download Error State */}
          {downloadError ? (
            <View style={[styles.errorBox, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
              <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
              <Text style={styles.errorText}>{downloadError}</Text>
            </View>
          ) : null}

          {/* Action Buttons */}
          {!isDownloading ? (
            <View style={styles.actionsColumn}>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                onPress={enableLearningMode}
                accessibilityRole="button"
                accessibilityLabel={t.learningModePrompt.enableBtn}
              >
                <Ionicons name="cloud-download-outline" size={18} color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>
                  {downloadError ? t.learningModePrompt.retryBtn : t.learningModePrompt.enableBtn}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.secondaryBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={dismissLaunchPromptForLater}
                accessibilityRole="button"
                accessibilityLabel={t.learningModePrompt.laterBtn}
              >
                <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>
                  {t.learningModePrompt.laterBtn}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 430,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    flex: 1,
  },
  title: {
    fontSize: 17.5,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 2,
  },
  tamilOnlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  tamilOnlyBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    flex: 1,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    marginBottom: 14,
  },
  networkNoticeBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  networkTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  networkTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  networkBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  progressContainer: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressArtifactText: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
  actionsColumn: {
    gap: 10,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
});
