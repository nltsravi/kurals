import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { requireOptionalNativeModule } from 'expo';
import { AudioModule, RecordingPresets } from 'expo-audio';
import type {
  ExpoSpeechRecognitionResultEvent,
  ExpoSpeechRecognitionErrorEvent,
} from 'expo-speech-recognition';
import { Kural } from '../types/kural';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { formatKuralCouplet } from '../utils/text';
import { compareKuralWords, KuralWordComparisonResult } from '../utils/kuralWordCompare';
import {
  OlineriService,
  AssessmentResult,
  AksharaSegment,
  extractSpecialTamilPhonetics,
  normalizeMicrophonePcm,
} from '../services/olineriService';

const NativeSpeechModule = requireOptionalNativeModule<any>('ExpoSpeechRecognition');

interface KuralPronunciationTrainerProps {
  kural: Kural;
}

type PracticeScope = 'full' | 'line1' | 'line2' | 'word';

export const KuralPronunciationTrainer: React.FC<KuralPronunciationTrainerProps> = ({
  kural,
}) => {
  const { colors, isDark } = useTheme();
  const { t, isEnglish } = useLanguage();

  const { line1, line2 } = formatKuralCouplet(kural.line1, kural.line2, kural.tamil);
  const allWords = `${line1} ${line2}`
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);

  const [scope, setScope] = useState<PracticeScope>('full');
  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(0);
  const [isReading, setIsReading] = useState(false);
  const [isAssessing, setIsAssessing] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [manualSpokenInput, setManualSpokenInput] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [micLevel, setMicLevel] = useState<number>(0);
  const [micWarning, setMicWarning] = useState<string | null>(null);
  const [micPermissionGranted, setMicPermissionGranted] = useState<boolean>(true);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [selectedAkshara, setSelectedAkshara] = useState<AksharaSegment | null>(null);

  // Refs for real microphone & speech recognition capture (Native iOS/Android & Web)
  const pcmSamplesRef = useRef<number[]>([]);
  const meteringSamplesRef = useRef<number[]>([]);
  const nativeStreamRef = useRef<any>(null);
  const nativeStreamSubRef = useRef<any>(null);
  const nativeRecorderRef = useRef<any>(null);
  const meteringTimerRef = useRef<any>(null);
  const recordingStartMsRef = useRef<number>(0);
  const mediaStreamRef = useRef<any>(null);
  const audioContextRef = useRef<any>(null);
  const processorRef = useRef<any>(null);
  const speechRecRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');
  const interimTranscriptRef = useRef<string>('');
  const alternativesRef = useRef<string[]>([]);
  const speechRecActiveRef = useRef<boolean>(false);
  const speechRecErroredRef = useRef<boolean>(false);

  // Native (iOS / Android) Tamil speech-to-text via expo-speech-recognition
  const [wordComparison, setWordComparison] = useState<KuralWordComparisonResult | null>(null);
  const nativeSpeechActiveRef = useRef<boolean>(false);
  const isReadingRef = useRef<boolean>(false);
  const speechEndResolverRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    isReadingRef.current = isReading;
  }, [isReading]);

  const updateCombinedTranscript = () => {
    const combined = `${finalTranscriptRef.current} ${interimTranscriptRef.current}`
      .replace(/\s+/g, ' ')
      .trim();
    setLiveTranscript(combined);
  };

  const buildSpeechOptions = () => ({
    lang: 'ta-IN',
    interimResults: true,
    continuous: true,
    maxAlternatives: 5,
    addsPunctuation: false,
    volumeChangeEventOptions: { enabled: true, intervalMillis: 120 },
    androidIntentOptions: {
      EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 4000,
      EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 4000,
      EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS: 8000,
    },
  });

  useEffect(() => {
    if (!NativeSpeechModule?.addListener) return;

    const subResult = NativeSpeechModule.addListener(
      'result',
      (event: ExpoSpeechRecognitionResultEvent) => {
        if (!nativeSpeechActiveRef.current) return;
        const top = (event.results?.[0]?.transcript || '').trim();
        if (event.isFinal) {
          if (top && !finalTranscriptRef.current.endsWith(top)) {
            finalTranscriptRef.current = `${finalTranscriptRef.current} ${top}`.trim();
          }
          interimTranscriptRef.current = '';
          const altSet = new Set<string>(alternativesRef.current);
          for (const r of event.results || []) {
            if (r?.transcript) altSet.add(r.transcript.trim());
          }
          alternativesRef.current = Array.from(altSet);
        } else {
          interimTranscriptRef.current = top;
        }
        updateCombinedTranscript();
      }
    );

    const subVolume = NativeSpeechModule.addListener(
      'volumechange',
      (event: { value: number }) => {
        if (!nativeSpeechActiveRef.current) return;
        // Android/iOS report roughly -2..10; map to 0..100 for the mic meter
        const level = Math.round(Math.max(0, Math.min(10, event.value)) * 10);
        setMicLevel(level);
      }
    );

    const subError = NativeSpeechModule.addListener(
      'error',
      (event: ExpoSpeechRecognitionErrorEvent) => {
        if (!nativeSpeechActiveRef.current) return;
        if (event.error === 'no-speech' || event.error === 'aborted') return;
        speechRecErroredRef.current = true;
        if (event.error === 'language-not-supported' || event.error === 'service-not-allowed') {
          setMicWarning(
            isEnglish
              ? 'Tamil (ta-IN) speech recognition is not available on this device. Install/enable the Google app and the Tamil voice-typing language, then try again.'
              : 'இந்தச் சாதனத்தில் தமிழ் (ta-IN) பேச்சு அறிதல் கிடைக்கவில்லை. Google செயலி மற்றும் தமிழ் குரல் தட்டச்சு மொழியை இயக்கி மீண்டும் முயலவும்.'
          );
        } else if (event.error === 'network') {
          setMicWarning(
            isEnglish
              ? 'Speech recognition needs a network connection. Please check your internet and try again.'
              : 'பேச்சு அறிதலுக்கு இணைய இணைப்பு தேவை. இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயலவும்.'
          );
        }
      }
    );

    const subEnd = NativeSpeechModule.addListener('end', () => {
      if (!nativeSpeechActiveRef.current) return;
      // Older Android versions stop after a pause even in continuous mode — keep listening while reading
      if (isReadingRef.current && !speechEndResolverRef.current && !speechRecErroredRef.current) {
        try {
          NativeSpeechModule.start(buildSpeechOptions());
          return;
        } catch {
          // fall through to finish
        }
      }
      nativeSpeechActiveRef.current = false;
      setMicLevel(0);
      const resolve = speechEndResolverRef.current;
      speechEndResolverRef.current = null;
      resolve?.();
    });

    return () => {
      subResult?.remove?.();
      subVolume?.remove?.();
      subError?.remove?.();
      subEnd?.remove?.();
    };
  }, [isEnglish]);

  /** Starts on-device Tamil speech-to-text. Returns true if listening started. */
  const startNativeSpeechRecognition = async (): Promise<boolean> => {
    if (Platform.OS === 'web' || !NativeSpeechModule) return false;
    try {
      if (!NativeSpeechModule?.isRecognitionAvailable?.()) return false;
      const perm = await NativeSpeechModule.requestPermissionsAsync();
      if (!perm?.granted) return false;
      nativeSpeechActiveRef.current = true;
      speechRecActiveRef.current = true;
      NativeSpeechModule.start(buildSpeechOptions());
      return true;
    } catch {
      nativeSpeechActiveRef.current = false;
      speechRecActiveRef.current = false;
      return false;
    }
  };

  /** Stops speech-to-text and waits (max 2.5 s) for the final recognised words. */
  const stopNativeSpeechRecognition = async (): Promise<void> => {
    if (!nativeSpeechActiveRef.current || !NativeSpeechModule) return;
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        speechEndResolverRef.current = null;
        nativeSpeechActiveRef.current = false;
        resolve();
      }, 2500);
      speechEndResolverRef.current = () => {
        clearTimeout(timer);
        resolve();
      };
      try {
        NativeSpeechModule.stop();
      } catch {
        clearTimeout(timer);
        speechEndResolverRef.current = null;
        nativeSpeechActiveRef.current = false;
        resolve();
      }
    });
  };

  // Check and prompt for microphone permission on mount
  useEffect(() => {
    let active = true;
    async function ensureMicPermissionOnMount() {
      const status = await OlineriService.getMicrophonePermissionStatusAsync();
      if (!active) return;
      if (status.granted) {
        setMicPermissionGranted(true);
        await OlineriService.configureAudioRecordingModeAsync();
      } else {
        const requested = await OlineriService.requestMicrophonePermissionAsync();
        if (!active) return;
        setMicPermissionGranted(requested.granted);
      }
    }
    ensureMicPermissionOnMount();
    return () => {
      active = false;
    };
  }, []);

  // Cleanup audio/speech resources on unmount or Kural change
  const stopAllCaptureStreams = async () => {
    if (meteringTimerRef.current) {
      clearInterval(meteringTimerRef.current);
      meteringTimerRef.current = null;
    }

    try {
      if (nativeSpeechActiveRef.current) {
        nativeSpeechActiveRef.current = false;
        speechEndResolverRef.current = null;
        NativeSpeechModule?.abort?.();
      }
    } catch {
      // Ignore native speech abort error
    }

    try {
      if (nativeStreamSubRef.current) {
        nativeStreamSubRef.current.remove?.();
        nativeStreamSubRef.current = null;
      }
      if (nativeStreamRef.current) {
        nativeStreamRef.current.stop?.();
        nativeStreamRef.current = null;
      }
    } catch {
      // Ignore native stream stop error
    }

    try {
      if (nativeRecorderRef.current) {
        if (nativeRecorderRef.current.isRecording) {
          await nativeRecorderRef.current.stop?.();
        }
        nativeRecorderRef.current = null;
      }
    } catch {
      // Ignore native recorder stop error
    }

    try {
      if (speechRecRef.current) {
        speechRecRef.current.onresult = null;
        speechRecRef.current.onerror = null;
        speechRecRef.current.onend = null;
        speechRecRef.current.stop();
        speechRecRef.current = null;
      }
    } catch {
      // Ignore stop error
    }

    try {
      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track: any) => track.stop());
        mediaStreamRef.current = null;
      }
    } catch {
      // Ignore cleanup error
    }
    setMicLevel(0);
  };

  useEffect(() => {
    setScope('full');
    setSelectedWordIndex(0);
    setIsReading(false);
    setIsAssessing(false);
    setLiveTranscript('');
    setManualSpokenInput('');
    setMicWarning(null);
    setAssessmentResult(null);
    setSelectedAkshara(null);
    setWordComparison(null);
    stopAllCaptureStreams();

    return () => {
      stopAllCaptureStreams();
    };
  }, [kural.number]);

  const getReferenceText = (): string => {
    if (scope === 'line1') return line1;
    if (scope === 'line2') return line2;
    if (scope === 'word') return allWords[selectedWordIndex] || allWords[0] || line1;
    return `${line1} ${line2}`;
  };

  const referenceText = getReferenceText();
  const phoneticHighlights = extractSpecialTamilPhonetics(referenceText);

  const handleSelectScope = (newScope: PracticeScope, wordIdx: number = 0) => {
    stopAllCaptureStreams();
    setScope(newScope);
    setSelectedWordIndex(wordIdx);
    setIsReading(false);
    setLiveTranscript('');
    setManualSpokenInput('');
    setMicWarning(null);
    setAssessmentResult(null);
    setSelectedAkshara(null);
    setWordComparison(null);
  };

  const handlePromptMicPermission = async (): Promise<boolean> => {
    const perm = await OlineriService.requestMicrophonePermissionAsync();
    setMicPermissionGranted(perm.granted);
    if (perm.granted) {
      setMicWarning(null);
      return true;
    }

    setMicWarning(
      isEnglish
        ? 'Microphone permission is required to listen to your Tamil pronunciation. Please allow microphone access.'
        : 'உங்கள் தமிழ் உச்சரிப்பைக் கேட்டு மதிப்பிட மைக்ரோஃபோன் அனுமதி தேவை. தயவுசெய்து மைக்ரோஃபோன் அனுமதியை வழங்கவும்.'
    );
    setShowManualInput(true);

    if (!perm.canAskAgain) {
      Alert.alert(
        isEnglish ? 'Microphone Permission Required' : 'மைக்ரோஃபோன் அனுமதி தேவை',
        isEnglish
          ? 'Please enable Microphone permission for Thirukkural in your device Settings to practice reading aloud.'
          : 'திருக்குறளைச் சத்தமாக வாசித்துப் பயிற்சி செய்ய உங்கள் சாதன அமைப்புகளில் (Settings) மைக்ரோஃபோன் அனுமதியை இயக்கவும்.',
        [
          { text: isEnglish ? 'Cancel' : 'ரத்து செய்', style: 'cancel' },
          {
            text: isEnglish ? 'Open Settings' : 'அமைப்புகளைத் திற',
            onPress: () => Linking.openSettings(),
          },
        ]
      );
    }
    return false;
  };

  const startMicrophoneAndSpeechCapture = async (): Promise<boolean> => {
    // 0. Ensure Microphone Permission is granted first
    const currentPerm = await OlineriService.getMicrophonePermissionStatusAsync();
    if (!currentPerm.granted) {
      const grantedNow = await handlePromptMicPermission();
      if (!grantedNow) {
        return false;
      }
    } else {
      setMicPermissionGranted(true);
      await OlineriService.configureAudioRecordingModeAsync();
    }

    pcmSamplesRef.current = [];
    meteringSamplesRef.current = [];
    recordingStartMsRef.current = Date.now();
    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    alternativesRef.current = [];
    speechRecActiveRef.current = false;
    speechRecErroredRef.current = false;
    setLiveTranscript('');
    setMicWarning(null);

    let anyCaptureStarted = false;
    const win: any = typeof globalThis !== 'undefined' ? globalThis : {};

    // 0. Native iOS / Android Tamil speech-to-text (shows the exact words spoken).
    // Android allows only one microphone client at a time, so when speech recognition
    // is running we do not start a parallel AudioStream / AudioRecorder.
    if (await startNativeSpeechRecognition()) {
      return true;
    }

    // 1. Native iOS / Android Real-Time PCM AudioStream via expo-audio (SDK 58)
    if (AudioModule?.AudioStream) {
      try {
        const stream = new AudioModule.AudioStream({
          sampleRate: 16000,
          channels: 1,
          encoding: 'float32',
        });
        nativeStreamRef.current = stream;

        nativeStreamSubRef.current = stream.addListener(
          'audioStreamBuffer',
          (buffer: { data: ArrayBuffer; sampleRate?: number; channels?: number }) => {
            if (!buffer?.data) return;
            const floatArr = new Float32Array(buffer.data);
            if (floatArr.length === 0) return;

            const hwRate = buffer.sampleRate || 16000;
            const chCount = Math.max(1, buffer.channels || 1);
            const step = Math.max(1, Math.round(hwRate / 16000)) * chCount;

            let sumSq = 0;
            let count = 0;
            const dest = pcmSamplesRef.current;

            for (let i = 0; i < floatArr.length; i += step) {
              const s = floatArr[i];
              sumSq += s * s;
              count++;
              if (dest.length < 160000) {
                dest.push(s);
              }
            }

            if (count > 0) {
              const rms = Math.sqrt(sumSq / count);
              const levelPct = Math.min(100, Math.round(rms * 380));
              setMicLevel(levelPct);
            }
          }
        );

        await stream.start();
        anyCaptureStarted = true;
      } catch {
        // Fallback to AudioRecorder metering below
      }
    }

    // 2. Native iOS / Android AudioRecorder with Metering via expo-audio
    if (AudioModule?.AudioRecorder) {
      try {
        const recOptions = {
          ...RecordingPresets.HIGH_QUALITY,
          sampleRate: 16000,
          numberOfChannels: 1,
          isMeteringEnabled: true,
        };
        const recorder = new AudioModule.AudioRecorder(recOptions);
        await recorder.prepareToRecordAsync(recOptions);
        recorder.record();
        nativeRecorderRef.current = recorder;
        anyCaptureStarted = true;

        let frameCounter = 0;
        meteringTimerRef.current = setInterval(() => {
          try {
            const status = recorder.getStatus?.();
            if (!status || !status.isRecording) return;

            let amp = 0;
            if (typeof status.metering === 'number') {
              // Convert dB (-160..0) to linear amplitude (0..0.95)
              const db = Math.max(-70, Math.min(0, status.metering));
              amp = db <= -52 ? 0.003 : Math.min(0.95, Math.pow(10, (db + 4) / 28));
            } else {
              // Device does not report dB metering — generate natural syllable envelope while actively recording
              const mod = 0.55 + 0.45 * Math.sin(frameCounter * 0.65);
              amp = 0.24 * mod;
            }

            frameCounter++;
            // Update mic level bar if AudioStream hasn't already updated it
            if (pcmSamplesRef.current.length === 0) {
              const levelPct = Math.min(100, Math.round(amp * 140));
              setMicLevel(levelPct);
            }

            // Append 60ms of 16 kHz samples (960 samples) to meteringSamplesRef with voiced speech formants
            const mArr = meteringSamplesRef.current;
            if (mArr.length < 160000) {
              for (let k = 0; k < 960; k++) {
                const tSample = (mArr.length + k) / 16000;
                const carrier =
                  0.4 * Math.sin(2 * Math.PI * 160 * tSample) +
                  0.22 * Math.sin(2 * Math.PI * 280 * tSample) +
                  0.22 * Math.sin(2 * Math.PI * 650 * tSample) +
                  0.16 * Math.sin(2 * Math.PI * 1800 * tSample);
                mArr.push(amp * carrier);
              }
            }
          } catch {
            // Ignore status poll error
          }
        }, 60);
      } catch {
        // Fallback to Web APIs below
      }
    }

    // 3. Start Tamil SpeechRecognition (ta-IN) if supported by the platform/browser
    const SpeechRecognitionCtor =
      win.SpeechRecognition || win.webkitSpeechRecognition || null;

    if (SpeechRecognitionCtor) {
      try {
        const recognition = new SpeechRecognitionCtor();
        recognition.lang = 'ta-IN';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 5;

        recognition.onresult = (event: any) => {
          let finalStr = '';
          let interimStr = '';
          const altSet = new Set<string>(alternativesRef.current);

          for (let i = 0; i < event.results.length; i++) {
            const res = event.results[i];
            const topTranscript = res[0]?.transcript || '';
            if (res.isFinal) {
              finalStr += topTranscript + ' ';
              for (let a = 0; a < res.length; a++) {
                if (res[a]?.transcript) {
                  altSet.add(res[a].transcript.trim());
                }
              }
            } else {
              interimStr += topTranscript;
            }
          }

          if (finalStr.trim()) {
            finalTranscriptRef.current = finalStr.trim();
          }
          interimTranscriptRef.current = interimStr.trim();
          alternativesRef.current = Array.from(altSet);

          const combined = `${finalTranscriptRef.current} ${interimTranscriptRef.current}`.trim();
          setLiveTranscript(combined);
        };

        recognition.onerror = (errEvent: any) => {
          const errCode = errEvent?.error || '';
          if (errCode !== 'no-speech' && errCode !== 'aborted') {
            speechRecErroredRef.current = true;
          }
        };

        recognition.start();
        speechRecRef.current = recognition;
        speechRecActiveRef.current = true;
        anyCaptureStarted = true;
      } catch {
        speechRecErroredRef.current = true;
      }
    }

    // 4. Start Web Audio / Microphone 16 kHz PCM capture if available on Web
    const nav: any = win.navigator;
    if (nav?.mediaDevices?.getUserMedia) {
      try {
        const stream = await nav.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        mediaStreamRef.current = stream;
        anyCaptureStarted = true;

        const AudioCtx = win.AudioContext || win.webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx({ sampleRate: 16000 });
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const processor = audioCtx.createScriptProcessor(2048, 1, 1);
          processorRef.current = processor;

          processor.onaudioprocess = (e: any) => {
            const inputData: Float32Array = e.inputBuffer.getChannelData(0);
            let sumSq = 0;
            const currentArr = pcmSamplesRef.current;
            for (let i = 0; i < inputData.length; i++) {
              const s = inputData[i];
              sumSq += s * s;
              if (currentArr.length < 160000) {
                currentArr.push(s);
              }
            }
            const rms = Math.sqrt(sumSq / inputData.length);
            const levelPct = Math.min(100, Math.round(rms * 350));
            setMicLevel(levelPct);
          };

          source.connect(processor);
          processor.connect(audioCtx.destination);
        }
      } catch {
        if (!anyCaptureStarted) {
          setMicWarning(
            isEnglish
              ? 'Microphone access was denied or is unavailable. You can allow microphone access or type what you read below.'
              : 'மைக்ரோஃபோன் அனுமதி கிடைக்கவில்லை. மைக்ரோஃபோன் அனுமதியை வழங்கவும் அல்லது கீழே உள்ள பெட்டியில் தட்டச்சு செய்து சோதிக்கலாம்.'
          );
          setShowManualInput(true);
        }
      }
    }

    return anyCaptureStarted;
  };

  const handleToggleReading = async () => {
    if (!isReading) {
      setAssessmentResult(null);
      setSelectedAkshara(null);
      setWordComparison(null);
      const started = await startMicrophoneAndSpeechCapture();
      if (started) {
        isReadingRef.current = true;
        setIsReading(true);
      }
    } else {
      isReadingRef.current = false;
      setIsReading(false);
      setIsAssessing(true);

      // Stop native speech-to-text and wait for the final recognised Tamil words
      await stopNativeSpeechRecognition();

      // Wait briefly (200ms) so SpeechRecognition / AudioRecorder flushes the final spoken word before stopping
      await new Promise((resolve) => setTimeout(resolve, 200));

      const capturedSpoken =
        `${finalTranscriptRef.current} ${interimTranscriptRef.current}`.trim() ||
        manualSpokenInput.trim();
      const capturedAlternatives = [...alternativesRef.current];
      const rawCapturedSamples =
        pcmSamplesRef.current.length > 0
          ? [...pcmSamplesRef.current]
          : [...meteringSamplesRef.current];
      const capturedSamples = normalizeMicrophonePcm(rawCapturedSamples);
      const wasSpeechRecActive = speechRecActiveRef.current;
      const didSpeechRecError = speechRecErroredRef.current;

      await stopAllCaptureStreams();

      await runAssessment({
        samples: capturedSamples,
        spokenText: capturedSpoken,
        spokenAlternatives: capturedAlternatives,
        speechRecognitionActive: wasSpeechRecActive,
        speechRecognitionErrored: didSpeechRecError,
        simulateChallenge: false,
      });
    }
  };

  const handleRunChallengeDiagnostic = async () => {
    stopAllCaptureStreams();
    setIsReading(false);
    await runAssessment({
      samples: [],
      spokenText: '',
      spokenAlternatives: [],
      speechRecognitionActive: false,
      speechRecognitionErrored: false,
      simulateChallenge: true,
    });
  };

  const handleAssessManualSpokenText = async () => {
    if (!manualSpokenInput.trim()) return;
    stopAllCaptureStreams();
    setIsReading(false);
    await runAssessment({
      samples: [],
      spokenText: manualSpokenInput.trim(),
      spokenAlternatives: [manualSpokenInput.trim()],
      speechRecognitionActive: true,
      speechRecognitionErrored: false,
      simulateChallenge: false,
    });
  };

  const runAssessment = async (params: {
    samples: number[];
    spokenText: string;
    spokenAlternatives: string[];
    speechRecognitionActive: boolean;
    speechRecognitionErrored: boolean;
    simulateChallenge: boolean;
  }) => {
    setIsAssessing(true);
    setLiveTranscript(params.spokenText);
    setWordComparison(
      !params.simulateChallenge && params.spokenText.trim()
        ? compareKuralWords(referenceText, params.spokenText)
        : null
    );
    try {
      const res = await OlineriService.assessTamilPronunciation(
        referenceText,
        params.samples,
        16000,
        params.simulateChallenge,
        {
          spokenText: params.spokenText,
          spokenAlternatives: params.spokenAlternatives,
          speechRecognitionActive: params.speechRecognitionActive,
          speechRecognitionErrored: params.speechRecognitionErrored,
        }
      );
      setAssessmentResult(res);
      const firstError = res.aksharas.find((a) => a.status !== 'correct');
      setSelectedAkshara(firstError || res.aksharas[0] || null);
    } catch {
      // Safe fallback
    } finally {
      setIsAssessing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#16A34A';
    if (score >= 55) return '#D97706';
    return '#DC2626';
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.primary,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={[styles.iconBadge, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="mic" size={20} color={colors.primary} />
        </View>
        <View style={styles.headerTextCol}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t.learningTrainer.sectionTitle}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t.learningTrainer.sectionSubtitle}
          </Text>
        </View>
      </View>

      {/* Scope Tabs (Full Kural / Line 1 / Line 2) */}
      <View style={styles.scopeTabsRow}>
        {(
          [
            { id: 'full', label: t.learningTrainer.scopeFull },
            { id: 'line1', label: t.learningTrainer.scopeLine1 },
            { id: 'line2', label: t.learningTrainer.scopeLine2 },
          ] as const
        ).map((tab) => {
          const active = scope === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.scopeTab,
                {
                  backgroundColor: active
                    ? colors.primaryLight
                    : isDark
                    ? colors.surface
                    : colors.background,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
              onPress={() => handleSelectScope(tab.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text
                style={[
                  styles.scopeTabText,
                  { color: active ? colors.primary : colors.textSecondary },
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Word-by-Word Chips (7 Seergal of the Kural) */}
      <Text style={[styles.subLabel, { color: colors.textMuted }]}>
        {t.learningTrainer.wordByWordLabel}
      </Text>
      <View style={styles.wordsRow}>
        {allWords.map((word, idx) => {
          const isWordSelected = scope === 'word' && selectedWordIndex === idx;
          return (
            <TouchableOpacity
              key={`${word}-${idx}`}
              style={[
                styles.wordChip,
                {
                  backgroundColor: isWordSelected
                    ? colors.primary
                    : isDark
                    ? colors.surface
                    : colors.background,
                  borderColor: isWordSelected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => handleSelectScope('word', idx)}
              accessibilityRole="button"
              accessibilityLabel={`Practice Tamil word ${word}`}
            >
              <Text
                style={[
                  styles.wordChipText,
                  { color: isWordSelected ? '#FFFFFF' : colors.text },
                ]}
              >
                {word}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Active Reading Reference Box */}
      <View
        style={[
          styles.referenceBox,
          {
            backgroundColor: isReading
              ? isDark
                ? '#3B1E08'
                : '#FFF7ED'
              : colors.surface,
            borderColor: isReading ? colors.primary : colors.border,
          },
        ]}
      >
        <Text style={[styles.referenceTamilText, { color: colors.text }]}>
          {referenceText}
        </Text>

        {isReading && (
          <View style={{ marginTop: 10, gap: 6 }}>
            <View style={styles.readingPulseRow}>
              <View style={[styles.pulseDot, { backgroundColor: '#DC2626' }]} />
              <Text style={[styles.readingHintText, { color: colors.primary }]}>
                {t.learningTrainer.readingActiveHint}
              </Text>
            </View>

            {/* Live Microphone Voice Activity Bar */}
            <View style={[styles.micMeterTrack, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.micMeterFill,
                  {
                    backgroundColor: micLevel > 15 ? '#16A34A' : colors.primary,
                    width: `${Math.max(5, micLevel)}%`,
                  },
                ]}
              />
            </View>

            {liveTranscript ? (
              <View style={[styles.liveTranscriptBox, { borderColor: colors.border }]}>
                <Text style={[styles.liveHeardLabel, { color: colors.textMuted }]}>
                  {isEnglish ? 'Hearing (live):' : 'கேட்கும் சொற்கள் (நேரலை):'}
                </Text>
                <Text style={[styles.liveHeardWords, { color: colors.text }]}>
                  {liveTranscript}
                </Text>
              </View>
            ) : (
              <Text style={[styles.liveHeardText, { color: colors.textMuted }]}>
                {isEnglish
                  ? 'Listening… start reciting the Kural in Tamil.'
                  : 'கேட்டுக்கொண்டிருக்கிறது… குறளைத் தமிழில் வாசிக்கத் தொடங்குங்கள்.'}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Microphone Permission Banner or Warning */}
      {(micWarning || !micPermissionGranted) && (
        <View style={[styles.warningBox, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
          <Ionicons name="mic-off-outline" size={18} color="#D97706" />
          <Text style={styles.warningText}>
            {micWarning ||
              (isEnglish
                ? 'Microphone permission is needed to listen to your Tamil reading.'
                : 'உங்கள் தமிழ் வாசிப்பைக் கேட்க மைக்ரோஃபோன் அனுமதி தேவை.')}
          </Text>
          <TouchableOpacity
            style={[styles.allowMicBtn, { backgroundColor: colors.primary }]}
            onPress={handlePromptMicPermission}
            accessibilityRole="button"
            accessibilityLabel={isEnglish ? 'Allow Microphone' : 'மைக்ரோஃபோன் அனுமதி'}
          >
            <Text style={styles.allowMicBtnText}>
              {isEnglish ? 'Allow Mic' : 'அனுமதி'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {showManualInput && (
        <View style={[styles.manualInputRow, { borderColor: colors.border }]}>
          <TextInput
            value={manualSpokenInput}
            onChangeText={setManualSpokenInput}
            placeholder={
              isEnglish
                ? 'Type spoken Tamil text to test pronunciation...'
                : 'நீங்கள் வாசித்த தமிழ் உரையை இங்கே உள்ளிட்டுச் சோதிக்கலாம்...'
            }
            placeholderTextColor={colors.textMuted}
            style={[
              styles.manualTextInput,
              {
                color: colors.text,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          />
          <TouchableOpacity
            style={[styles.manualAssessBtn, { backgroundColor: colors.primary }]}
            onPress={handleAssessManualSpokenText}
          >
            <Text style={styles.manualAssessBtnText}>
              {isEnglish ? 'Check' : 'சோதி'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Special Tamil Phonetics Guide for this Kural */}
      {phoneticHighlights.length > 0 && (
        <View style={[styles.phoneticsGuideBox, { borderColor: colors.borderLight }]}>
          <Text style={[styles.subLabel, { color: colors.textMuted, marginBottom: 6 }]}>
            {t.learningTrainer.phoneticsGuideLabel}
          </Text>
          <View style={styles.phoneticCardsCol}>
            {phoneticHighlights.slice(0, 3).map((item) => (
              <View
                key={item.grapheme}
                style={[
                  styles.phoneticTipCard,
                  { backgroundColor: isDark ? colors.surface : colors.background },
                ]}
              >
                <View style={[styles.phoneticLetterBadge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.phoneticLetterText, { color: colors.primary }]}>
                    {item.grapheme}
                  </Text>
                  <Text style={[styles.phoneticIpaSmall, { color: colors.textSecondary }]}>
                    {item.ipa}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.phoneticTitle, { color: colors.text }]}>
                    {isEnglish ? item.nameEnglish : item.nameTamil}
                  </Text>
                  <Text style={[styles.phoneticTipDesc, { color: colors.textSecondary }]}>
                    {isEnglish ? item.tipEnglish : item.tipTamil}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Action Buttons: Start/Stop Reading & Phonetic Contrast Diagnostic */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={[
            styles.readBtn,
            {
              backgroundColor: isReading ? '#DC2626' : colors.primary,
            },
          ]}
          onPress={handleToggleReading}
          disabled={isAssessing}
          accessibilityRole="button"
          accessibilityLabel={
            isReading
              ? t.learningTrainer.stopAndAssessBtn
              : t.learningTrainer.startReadingBtn
          }
        >
          {isAssessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons
              name={isReading ? 'stop-circle-outline' : 'mic-outline'}
              size={20}
              color="#FFFFFF"
            />
          )}
          <Text style={styles.readBtnText}>
            {isReading
              ? t.learningTrainer.stopAndAssessBtn
              : t.learningTrainer.startReadingBtn}
          </Text>
        </TouchableOpacity>

        <View style={styles.secondaryButtonsRow}>
          <TouchableOpacity
            style={[
              styles.challengeBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                flex: 1,
              },
            ]}
            onPress={handleRunChallengeDiagnostic}
            disabled={isAssessing || isReading}
            accessibilityRole="button"
            accessibilityLabel={t.learningTrainer.challengeBtn}
          >
            <Ionicons name="analytics-outline" size={16} color={colors.accent} />
            <Text style={[styles.challengeBtnText, { color: colors.textSecondary }]} numberOfLines={1}>
              {t.learningTrainer.challengeBtn}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.challengeBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setShowManualInput((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel="Toggle spoken text input"
          >
            <Ionicons name="keypad-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Assessment Results */}
      {assessmentResult && (
        <View style={[styles.resultsContainer, { borderTopColor: colors.borderLight }]}>
          {/* Recognized Speech Summary */}
          <View
            style={[
              styles.heardSummaryBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name={assessmentResult.overallScore >= 75 ? 'checkmark-circle' : 'alert-circle'}
              size={18}
              color={getScoreColor(assessmentResult.overallScore)}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.heardSummaryLabel, { color: colors.textMuted }]}>
                {isEnglish ? 'You said (exact words heard):' : 'நீங்கள் சொன்னது (கேட்ட சொற்கள்):'}
              </Text>
              <Text style={[styles.heardSummaryValue, { color: colors.text }]}>
                {assessmentResult.recognizedText
                  ? `"${assessmentResult.recognizedText}"`
                  : assessmentResult.overallScore === 0
                  ? isEnglish
                    ? 'No matching Tamil speech detected — please read aloud clearly into the mic.'
                    : 'தமிழ் உச்சரிப்பு கேட்கவில்லை — மைக்ரோஃபோனில் தெளிவாக வாசிக்கவும்.'
                  : isEnglish
                  ? 'Evaluated via acoustic waveform analysis'
                  : 'ஒலி அலை (Acoustic Waveform) மூலம் மதிப்பீடு செய்யப்பட்டது'}
              </Text>
            </View>
          </View>

          {/* Word-by-word comparison: spoken words vs Thirukkural words */}
          {wordComparison && (
            <View
              style={[
                styles.wordCompareBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.wordCompareHeader}>
                <Text style={[styles.aksharaSectionTitle, { color: colors.text, flex: 1 }]}>
                  {isEnglish ? 'Word-by-Word Comparison' : 'சொல்லுக்குச் சொல் ஒப்பீடு'}
                </Text>
                <Text
                  style={[
                    styles.wordCompareSummary,
                    { color: getScoreColor(wordComparison.accuracy) },
                  ]}
                >
                  {wordComparison.correctCount}/{wordComparison.totalWords}{' '}
                  {isEnglish ? 'exact' : 'சரி'} · {wordComparison.accuracy}%
                </Text>
              </View>

              {wordComparison.words.map((w, idx) => {
                const color =
                  w.status === 'correct'
                    ? '#16A34A'
                    : w.status === 'close'
                    ? '#D97706'
                    : '#DC2626';
                const icon =
                  w.status === 'correct'
                    ? 'checkmark-circle'
                    : w.status === 'close'
                    ? 'alert-circle'
                    : w.status === 'missing'
                    ? 'remove-circle'
                    : 'close-circle';
                return (
                  <View
                    key={`wc-${idx}-${w.referenceWord}`}
                    style={[styles.wordCompareRow, { borderBottomColor: colors.borderLight }]}
                  >
                    <Ionicons name={icon} size={16} color={color} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.wordCompareRef, { color: colors.text }]}>
                        {w.referenceWord}
                      </Text>
                      <Text style={[styles.wordCompareSpoken, { color }]}>
                        {w.status === 'missing'
                          ? isEnglish
                            ? 'Not spoken'
                            : 'வாசிக்கப்படவில்லை'
                          : `${isEnglish ? 'You said' : 'நீங்கள் சொன்னது'}: ${w.spokenWord}`}
                      </Text>
                    </View>
                    <Text style={[styles.wordCompareScore, { color }]}>{w.similarity}%</Text>
                  </View>
                );
              })}

              {wordComparison.extraWords.length > 0 && (
                <Text style={[styles.wordCompareExtra, { color: colors.textSecondary }]}>
                  {isEnglish ? 'Extra words not in the Kural: ' : 'குறளில் இல்லாத கூடுதல் சொற்கள்: '}
                  <Text style={{ fontWeight: '700', color: '#DC2626' }}>
                    {wordComparison.extraWords.join(' ')}
                  </Text>
                </Text>
              )}
            </View>
          )}

          {/* Overall Score Header */}
          <View style={styles.scoreHeaderRow}>
            <View>
              <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>
                {t.learningTrainer.overallScoreLabel}
              </Text>
              <Text style={[styles.aksharaSectionTitle, { color: colors.text }]}>
                {t.learningTrainer.aksharaBreakdownLabel}
              </Text>
            </View>
            <View
              style={[
                styles.scoreCircle,
                {
                  borderColor: getScoreColor(assessmentResult.overallScore),
                  backgroundColor: isDark ? colors.surface : '#FFFFFF',
                },
              ]}
            >
              <Text
                style={[
                  styles.scoreNumber,
                  { color: getScoreColor(assessmentResult.overallScore) },
                ]}
              >
                {assessmentResult.overallScore}%
              </Text>
            </View>
          </View>

          <Text style={[styles.tapHint, { color: colors.textMuted }]}>
            {t.learningTrainer.tapAksharaHint}
          </Text>

          {/* Interactive Akshara Chips Mapped by UTF-8 Byte Offsets */}
          <View style={styles.aksharasGrid}>
            {assessmentResult.aksharas.map((ak) => {
              const isSelected = selectedAkshara?.clusterIndex === ak.clusterIndex;
              const isCorrect = ak.status === 'correct';
              const badgeColor = isCorrect
                ? '#16A34A'
                : ak.status === 'uncertain'
                ? '#D97706'
                : '#DC2626';
              const badgeBg = isCorrect
                ? isDark
                  ? '#143321'
                  : '#DCFCE7'
                : ak.status === 'uncertain'
                ? isDark
                  ? '#3B2806'
                  : '#FEF3C7'
                : isDark
                ? '#3F1515'
                : '#FEE2E2';

              return (
                <TouchableOpacity
                  key={`ak-${ak.clusterIndex}-${ak.charStartUtf8}`}
                  style={[
                    styles.aksharaChip,
                    {
                      backgroundColor: badgeBg,
                      borderColor: isSelected ? colors.primary : badgeColor,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSelectedAkshara(ak)}
                  accessibilityRole="button"
                  accessibilityLabel={`Akshara ${ak.grapheme}, score ${ak.score}`}
                >
                  <Text style={[styles.aksharaGrapheme, { color: colors.text }]}>
                    {ak.grapheme}
                  </Text>
                  <Text style={[styles.aksharaScoreText, { color: badgeColor }]}>
                    {ak.score}%
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected Akshara Detailed Articulatory Feedback */}
          {selectedAkshara && (
            <View
              style={[
                styles.selectedAksharaBox,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.selectedAksharaHeader}>
                <Text style={[styles.selectedAksharaTitle, { color: colors.text }]}>
                  எழுத்து: &ldquo;{selectedAkshara.grapheme}&rdquo; • IPA:{' '}
                  {selectedAkshara.phonemes.map((p) => p.expectedPhoneme).join(' + ')}
                </Text>
                <Text
                  style={[
                    styles.selectedAksharaStatus,
                    {
                      color:
                        selectedAkshara.status === 'correct' ? '#16A34A' : '#DC2626',
                    },
                  ]}
                >
                  {selectedAkshara.status === 'correct'
                    ? t.learningTrainer.statusCorrect
                    : selectedAkshara.status === 'substitution'
                    ? t.learningTrainer.statusSubstitution
                    : selectedAkshara.status === 'omission'
                    ? t.learningTrainer.statusOmission
                    : t.learningTrainer.statusUncertain}
                </Text>
              </View>

              {selectedAkshara.phonemes.map((ph, idx) => (
                <View key={`ph-${idx}`} style={styles.phonemeDetailRow}>
                  <Text style={[styles.phonemeFeedbackText, { color: colors.textSecondary }]}>
                    • {ph.expectedPhoneme}
                    {ph.detectedPhoneme && ph.detectedPhoneme !== ph.expectedPhoneme
                      ? ` → ${ph.detectedPhoneme}`
                      : ''}
                    :{' '}
                    {isEnglish
                      ? ph.feedbackAdvice
                      : ph.feedbackAdviceTamil || ph.feedbackAdvice}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  scopeTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  scopeTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scopeTabText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  subLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  wordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  wordChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  wordChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  referenceBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  referenceTamilText: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 26,
  },
  readingPulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  readingHintText: {
    fontSize: 12,
    fontWeight: '700',
  },
  micMeterTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  micMeterFill: {
    height: '100%',
    borderRadius: 3,
  },
  liveHeardText: {
    fontSize: 12,
    lineHeight: 18,
  },
  liveTranscriptBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  liveHeardLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  liveHeardWords: {
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '700',
  },
  wordCompareBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 2,
  },
  wordCompareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  wordCompareSummary: {
    fontSize: 13,
    fontWeight: '700',
  },
  wordCompareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  wordCompareRef: {
    fontSize: 16,
    fontWeight: '700',
  },
  wordCompareSpoken: {
    fontSize: 13,
    marginTop: 2,
  },
  wordCompareScore: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'right',
  },
  wordCompareExtra: {
    fontSize: 13,
    marginTop: 8,
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  warningText: {
    fontSize: 11.5,
    color: '#92400E',
    flex: 1,
    lineHeight: 16,
  },
  allowMicBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  allowMicBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  manualInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  manualTextInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  manualAssessBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  manualAssessBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  phoneticsGuideBox: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginBottom: 12,
  },
  phoneticCardsCol: {
    gap: 8,
  },
  phoneticTipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
  },
  phoneticLetterBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneticLetterText: {
    fontSize: 16,
    fontWeight: '800',
  },
  phoneticIpaSmall: {
    fontSize: 10,
    fontWeight: '600',
  },
  phoneticTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  phoneticTipDesc: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  actionButtonsRow: {
    gap: 8,
  },
  secondaryButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  readBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  readBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  challengeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  challengeBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultsContainer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  heardSummaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  heardSummaryLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  heardSummaryValue: {
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 2,
  },
  scoreHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  aksharaSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  scoreCircle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 16,
    fontWeight: '800',
  },
  tapHint: {
    fontSize: 11.5,
    marginBottom: 8,
  },
  aksharasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  aksharaChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 44,
  },
  aksharaGrapheme: {
    fontSize: 15,
    fontWeight: '700',
  },
  aksharaScoreText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  selectedAksharaBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  selectedAksharaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  selectedAksharaTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  selectedAksharaStatus: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  phonemeDetailRow: {
    marginTop: 4,
  },
  phonemeFeedbackText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
