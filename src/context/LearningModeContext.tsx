import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  OlineriService,
  InstalledLanguageInfo,
  LearningDownloadProgress,
} from '../services/olineriService';

interface LearningModeContextType {
  isLearningModeEnabled: boolean;
  isLoadingState: boolean;
  showLaunchPromptModal: boolean;
  isDownloading: boolean;
  downloadProgress: LearningDownloadProgress | null;
  downloadError: string | null;
  installedPackage: InstalledLanguageInfo | null;
  hasMicrophonePermission: boolean;
  enableLearningMode: () => Promise<boolean>;
  requestMicrophonePermission: () => Promise<boolean>;
  dismissLaunchPromptForLater: () => Promise<void>;
  clearDownloadError: () => void;
}

const LearningModeContext = createContext<LearningModeContextType>({
  isLearningModeEnabled: false,
  isLoadingState: true,
  showLaunchPromptModal: false,
  isDownloading: false,
  downloadProgress: null,
  downloadError: null,
  installedPackage: null,
  hasMicrophonePermission: false,
  enableLearningMode: async () => false,
  requestMicrophonePermission: async () => false,
  dismissLaunchPromptForLater: async () => {},
  clearDownloadError: () => {},
});

export const LearningModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLearningModeEnabled, setIsLearningModeEnabled] = useState(false);
  const [isLoadingState, setIsLoadingState] = useState(true);
  const [showLaunchPromptModal, setShowLaunchPromptModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<LearningDownloadProgress | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [installedPackage, setInstalledPackage] = useState<InstalledLanguageInfo | null>(null);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    async function initLearningModeState() {
      try {
        const [enabled, seenPrompt] = await Promise.all([
          OlineriService.isLearningModeEnabled(),
          OlineriService.hasSeenLaunchPrompt(),
        ]);

        if (!mounted) return;

        if (enabled) {
          setIsLearningModeEnabled(true);
          setShowLaunchPromptModal(false);
          await OlineriService.loadInstalledTamilSdk();
          if (mounted) {
            setInstalledPackage(OlineriService.getInstalledPackageInfo());
          }
          // Check & prompt for microphone permission if Learning Mode is enabled
          const permStatus = await OlineriService.getMicrophonePermissionStatusAsync();
          if (permStatus.granted) {
            await OlineriService.configureAudioRecordingModeAsync();
            if (mounted) setHasMicrophonePermission(true);
          } else {
            const reqPerm = await OlineriService.requestMicrophonePermissionAsync();
            if (mounted) setHasMicrophonePermission(reqPerm.granted);
          }
        } else {
          setIsLearningModeEnabled(false);
          // Ask user when launching the app if they haven't decided yet
          if (!seenPrompt) {
            setShowLaunchPromptModal(true);
          }
        }
      } catch {
        // Safe fallback on init error
      } finally {
        if (mounted) {
          setIsLoadingState(false);
        }
      }
    }

    initLearningModeState();

    return () => {
      mounted = false;
    };
  }, []);

  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    const res = await OlineriService.requestMicrophonePermissionAsync();
    setHasMicrophonePermission(res.granted);
    return res.granted;
  }, []);

  const enableLearningMode = useCallback(async (): Promise<boolean> => {
    if (isLearningModeEnabled || isDownloading) {
      return isLearningModeEnabled;
    }

    setIsDownloading(true);
    setDownloadError(null);
    setDownloadProgress({
      step: 1,
      totalSteps: 7,
      currentArtifact: 'Requesting microphone permission & connecting to Olineri Tamil SDK...',
      percentage: 5,
    });

    try {
      // Prompt user for microphone permission right when enabling Learning Mode
      const initialPerm = await OlineriService.requestMicrophonePermissionAsync();
      setHasMicrophonePermission(initialPerm.granted);

      const pkg = await OlineriService.enableAndDownloadTamilSdk((progress) => {
        setDownloadProgress(progress);
      });
      const finalPerm = await OlineriService.getMicrophonePermissionStatusAsync();
      setHasMicrophonePermission(finalPerm.granted || initialPerm.granted);
      setInstalledPackage(pkg);
      setIsLearningModeEnabled(true);
      setShowLaunchPromptModal(false);
      setIsDownloading(false);
      return true;
    } catch (err: any) {
      const msg =
        err?.message ||
        'Unable to download the Tamil pronunciation library. Please check your internet connection and try again.';
      setDownloadError(msg);
      setIsDownloading(false);
      return false;
    }
  }, [isLearningModeEnabled, isDownloading]);

  const dismissLaunchPromptForLater = useCallback(async (): Promise<void> => {
    await OlineriService.markLaunchPromptSeen();
    setShowLaunchPromptModal(false);
    setDownloadError(null);
  }, []);

  const clearDownloadError = useCallback(() => {
    setDownloadError(null);
  }, []);

  return (
    <LearningModeContext.Provider
      value={{
        isLearningModeEnabled,
        isLoadingState,
        showLaunchPromptModal,
        isDownloading,
        downloadProgress,
        downloadError,
        installedPackage,
        hasMicrophonePermission,
        enableLearningMode,
        requestMicrophonePermission,
        dismissLaunchPromptForLater,
        clearDownloadError,
      }}
    >
      {children}
    </LearningModeContext.Provider>
  );
};

export const useLearningMode = () => useContext(LearningModeContext);

