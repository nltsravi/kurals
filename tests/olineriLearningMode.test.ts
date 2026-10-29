import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import {
  OlineriService,
  REQUIRED_TAMIL_ARTIFACTS,
  TAMIL_LANGUAGE_TAG,
  TAMIL_PACKAGE_ID,
  OLINERI_REPO_URL,
  convertTamilG2P,
  extractSpecialTamilPhonetics,
  PronunciationSDK,
  generateCorrectSpeechWaveform,
  generateMispronouncedWaveform,
  normalizeMicrophonePcm,
  statusSeverity,
} from '../src/services/olineriService';
import { TRANSLATIONS } from '../src/constants/translations';

const MOCK_PHONEME_INVENTORY = {
  language: 'ta-IN',
  phonemes: [
    { ipa: '/ɐ/', tokenId: 1, type: 'vowel', length: 'short', grapheme: 'அ' },
    { ipa: '/ɻ/', tokenId: 27, type: 'consonant', place: 'retroflex', manner: 'approximant', grapheme: 'ழ்' },
  ],
};

const MOCK_FEEDBACK_TA = {
  language: 'ta',
  instructions: {
    correct: 'மிகச் சரியான உச்சரிப்பு! ஒலிப்பு துல்லியமாக உள்ளது.',
    '/ɻ/_sub_/l/':
      'ழகரத்திற்குப் பதிலாக லகரம் ஒலித்தது. நாவின் நுனியை மேல்நோக்கி வளைத்து, மேல் அண்ணத்தைத் தொடாமல் காற்று வெளிப்படுமாறு ஒலிக்கவும்.',
  },
};

const MOCK_FEEDBACK_EN = {
  language: 'en',
  instructions: {
    correct: 'Excellent pronunciation! Articulation accurately matches native acoustic targets.',
    '/ɻ/_sub_/l/':
      "You pronounced an alveolar 'l' (ல) instead of retroflex 'zh' (ழ). Curl the tip of your tongue backward towards the hard palate.",
  },
};

const MOCK_TEST_CASES = {
  language: 'ta-IN',
  cases: [
    {
      id: 'ta_minimal_pair_pazham',
      text: 'பழம்',
      meaning: 'fruit',
      expectedPhonemes: ['/p/', '/ɐ/', '/ɻ/', '/ɐ/', '/m/'],
      criticalPhoneme: '/ɻ/',
      criticalGrapheme: 'ழ',
    },
  ],
};

describe('Olineri Tamil Pronunciation Learning Mode', () => {
  const originalFetch = global.fetch;

  beforeEach(async () => {
    await AsyncStorage.clear();
    OlineriService._resetForTests();

    global.fetch = jest.fn(async (url: RequestInfo | URL) => {
      const urlStr = String(url);
      let body: any = {};
      if (urlStr.includes('phoneme_inventory.json')) {
        body = MOCK_PHONEME_INVENTORY;
      } else if (urlStr.includes('strings_ta.json')) {
        body = MOCK_FEEDBACK_TA;
      } else if (urlStr.includes('strings_en.json')) {
        body = MOCK_FEEDBACK_EN;
      } else if (urlStr.includes('test_cases.json')) {
        body = MOCK_TEST_CASES;
      } else {
        body = '// SDK TypeScript source';
      }

      return {
        ok: true,
        status: 200,
        text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
      } as Response;
    });
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  test('1. Repository & Artifact Policy: only downloads Tamil (ta / ta-IN / lang-ta) artifacts and excludes sa, hi, te', () => {
    expect(OLINERI_REPO_URL).toBe('https://github.com/nltsravi/olineri-core.git');
    expect(TAMIL_LANGUAGE_TAG).toBe('ta-IN');
    expect(TAMIL_PACKAGE_ID).toBe('lang-ta');
    expect(REQUIRED_TAMIL_ARTIFACTS.length).toBeGreaterThan(0);

    for (const artifact of REQUIRED_TAMIL_ARTIFACTS) {
      expect(artifact.url).toContain('raw.githubusercontent.com/nltsravi/olineri-core/main/');
      expect(artifact.relativePath).not.toMatch(/language-resources\/(sa|hi|te)\//);
    }

    const langResourceArtifacts = REQUIRED_TAMIL_ARTIFACTS.filter((a) =>
      a.relativePath.startsWith('language-resources/')
    );
    expect(langResourceArtifacts.length).toBe(4);
    langResourceArtifacts.forEach((a) => {
      expect(a.relativePath.startsWith('language-resources/ta/')).toBe(true);
    });
  });

  test('2. Launch Prompt & Consent Gate: does NOT download SDK before user explicitly enables Learning Mode', async () => {
    const initiallyEnabled = await OlineriService.isLearningModeEnabled();
    const initiallyPrompted = await OlineriService.hasSeenLaunchPrompt();

    expect(initiallyEnabled).toBe(false);
    expect(initiallyPrompted).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();

    await OlineriService.markLaunchPromptSeen();
    expect(await OlineriService.hasSeenLaunchPrompt()).toBe(true);
    expect(await OlineriService.isLearningModeEnabled()).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('3. Enabling Learning Mode downloads only Tamil artifacts and permanently enables Learning Mode (no disable option)', async () => {
    const progressSteps: number[] = [];
    const pkg = await OlineriService.enableAndDownloadTamilSdk((prog) => {
      progressSteps.push(prog.percentage);
    });

    expect(pkg.packageId).toBe('lang-ta');
    expect(pkg.languageTag).toBe('ta-IN');
    expect(progressSteps.length).toBeGreaterThan(0);
    expect(progressSteps[progressSteps.length - 1]).toBe(100);

    expect(global.fetch).toHaveBeenCalledTimes(REQUIRED_TAMIL_ARTIFACTS.length);
    for (const art of REQUIRED_TAMIL_ARTIFACTS) {
      expect(global.fetch).toHaveBeenCalledWith(art.url);
    }

    expect(await OlineriService.isLearningModeEnabled()).toBe(true);
    expect(await OlineriService.hasSeenLaunchPrompt()).toBe(true);

    // Microphone permission is prompted automatically when enabling Learning Mode
    expect(requestRecordingPermissionsAsync).toHaveBeenCalled();
    expect(setAudioModeAsync).toHaveBeenCalledWith(
      expect.objectContaining({ allowsRecording: true })
    );

    expect((OlineriService as any).disableLearningMode).toBeUndefined();
    expect((OlineriService as any).uninstallTamilSdk).toBeUndefined();
  });

  test('4. LanguageManager and PronunciationSDK reject non-Tamil languages', async () => {
    const sdk = await PronunciationSDK.initialize();

    await expect(
      sdk.languages.install('sa-IN', { source: 'local', localPath: '/tmp/lang-sa' })
    ).rejects.toThrow(/Only Tamil/);

    await expect(
      sdk.languages.install('hi-IN', { source: 'local', localPath: '/tmp/lang-hi' })
    ).rejects.toThrow(/Only Tamil/);

    await expect(
      sdk.languages.install('te-IN', { source: 'local', localPath: '/tmp/lang-te' })
    ).rejects.toThrow(/Only Tamil/);

    await expect(
      sdk.assessPronunciation({
        language: 'hi-IN',
        referenceText: 'कमल',
        audio: { type: 'pcmFloatArray', samples: [0.1, 0.2], sampleRate: 16000 },
      })
    ).rejects.toThrow(/configured exclusively for Tamil/);
  });

  test('5. Tamil G2P (convertTamilG2P) accurately transforms Tamil words & Kural 1 with exact UTF-8 byte spans', () => {
    const pazhamTargets = convertTamilG2P('பழம்');
    expect(pazhamTargets).toHaveLength(5);
    expect(pazhamTargets.map((t) => t.ipa)).toEqual(['/p/', '/ɐ/', '/ɻ/', '/ɐ/', '/m/']);
    expect(pazhamTargets[2].charStartUtf8).toBe(3);
    expect(pazhamTargets[2].charEndUtf8).toBe(6);
    expect(pazhamTargets[2].grapheme).toBe('ழ');

    const kural1Targets = convertTamilG2P('அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு');
    expect(kural1Targets.length).toBeGreaterThan(20);
    expect(kural1Targets.some((t) => t.ipa === '/ɻ/')).toBe(true);
    expect(kural1Targets.some((t) => t.ipa === '/r/')).toBe(true);
  });

  test('6. End-to-End Tamil Kural Pronunciation Assessment: accurate vs wrong pronunciation vs silence', async () => {
    await OlineriService.enableAndDownloadTamilSdk();

    const kuralText = 'அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு';
    const highlights = extractSpecialTamilPhonetics(kuralText);
    expect(highlights.some((h) => h.grapheme === 'ழ' && h.ipa === '/ɻ/')).toBe(true);
    expect(highlights.some((h) => h.grapheme === 'ற' && h.ipa === '/r/')).toBe(true);

    // 6a. Accurate spoken Tamil text -> >= 90%
    const correctResult = await OlineriService.assessTamilPronunciation(
      kuralText,
      [],
      16000,
      false,
      {
        spokenText: kuralText,
        speechRecognitionActive: true,
      }
    );
    expect(correctResult.overallScore).toBeGreaterThanOrEqual(90);
    expect(correctResult.phonemes.every((p) => p.status === 'correct')).toBe(true);

    // 6b. Wrong word / phrase spoken (e.g. saying "வணக்கம்" instead of Kural 1) -> low score (< 25%), NEVER 90%+
    const wrongWordResult = await OlineriService.assessTamilPronunciation(
      kuralText,
      [],
      16000,
      false,
      {
        spokenText: 'வணக்கம்',
        speechRecognitionActive: true,
      }
    );
    expect(wrongWordResult.overallScore).toBeLessThan(25);
    expect(wrongWordResult.phonemes.some((p) => p.status === 'omission')).toBe(true);

    // 6c. Non-Tamil / English gibberish spoken ("hello world") -> 0% score
    const englishSpokenResult = await OlineriService.assessTamilPronunciation(
      kuralText,
      [],
      16000,
      false,
      {
        spokenText: 'hello world',
        speechRecognitionActive: true,
      }
    );
    expect(englishSpokenResult.overallScore).toBe(0);

    // 6d. Mispronouncing specific Tamil minimal pair: saying "பலம்" (/l/) instead of "பழம்" (/ɻ/)
    const minimalPairResult = await OlineriService.assessTamilPronunciation(
      'பழம்',
      [],
      16000,
      false,
      {
        spokenText: 'பலம்',
        speechRecognitionActive: true,
      }
    );
    expect(minimalPairResult.overallScore).toBeLessThan(85);
    const zhPhoneme = minimalPairResult.phonemes.find((p) => p.expectedPhoneme === '/ɻ/');
    expect(zhPhoneme?.status).toBe('substitution');
    expect(zhPhoneme?.detectedPhoneme).toBe('/l/');
    expect(zhPhoneme?.score).toBeLessThan(50);
    expect(zhPhoneme?.feedbackAdviceTamil).toContain('ழகரத்திற்குப் பதிலாக லகரம்');

    // 6e. Silence / no speech -> 0% score
    const silentResult = await OlineriService.assessTamilPronunciation(
      kuralText,
      [],
      16000,
      false,
      {
        spokenText: '',
        speechRecognitionActive: true,
      }
    );
    expect(silentResult.overallScore).toBe(0);

    // 6f. Native microphone audio recording (when spokenText is '' and real 16kHz voice samples are captured)
    const voicedSamples: number[] = [];
    for (let i = 0; i < 16000 * 2.2; i++) {
      const tSec = i / 16000;
      const env = 0.55 + 0.45 * Math.sin(2 * Math.PI * 3.5 * tSec);
      voicedSamples.push(0.25 * env * Math.sin(2 * Math.PI * 175 * tSec));
    }
    const nativeWaveformResult = await OlineriService.assessTamilPronunciation(
      kuralText,
      voicedSamples,
      16000,
      false,
      {
        spokenText: '',
        speechRecognitionActive: false,
      }
    );
    expect(nativeWaveformResult.overallScore).toBeGreaterThanOrEqual(75);
  });

  test('7. Olineri Core SDK bug fixes: Formant/Viterbi CTC alignment, PCM gain normalization, and Akshara worst-status severity', async () => {
    await OlineriService.enableAndDownloadTamilSdk();

    // 7a. Multi-formant correct speech waveform for "பழம்" (F3 = 1800 Hz retroflex /ɻ/) -> >= 75% score
    const correctWave = generateCorrectSpeechWaveform(1100, 16000);
    const correctPazham = await OlineriService.assessTamilPronunciation(
      'பழம்',
      correctWave,
      16000,
      false,
      { spokenText: '', speechRecognitionActive: false }
    );
    expect(correctPazham.overallScore).toBeGreaterThanOrEqual(75);
    const zhCorrect = correctPazham.phonemes.find((p) => p.expectedPhoneme === '/ɻ/');
    expect(zhCorrect?.status).toBe('correct');

    // 7b. Mispronounced waveform (high F3 = 2950 Hz alveolar /l/ instead of retroflex /ɻ/ + early coda cutoff) -> < 50%
    const wrongWave = generateMispronouncedWaveform(1100, 16000);
    const wrongPazham = await OlineriService.assessTamilPronunciation(
      'பழம்',
      wrongWave,
      16000,
      false,
      { spokenText: '', speechRecognitionActive: false }
    );
    expect(wrongPazham.overallScore).toBeLessThan(50);
    const zhWrong = wrongPazham.phonemes.find((p) => p.expectedPhoneme === '/ɻ/');
    expect(['substitution', 'omission']).toContain(zhWrong?.status);
    const finalM = wrongPazham.phonemes[wrongPazham.phonemes.length - 1];
    expect(finalM.status).toBe('omission');

    // 7c. Microphone PCM DC-offset removal and gain normalization
    const quietSpeechWithDc = correctWave.map((s) => s * 0.08 + 0.04);
    const normalized = normalizeMicrophonePcm(quietSpeechWithDc);
    const normPeak = Math.max(...normalized.map((s) => Math.abs(s)));
    expect(normPeak).toBeCloseTo(0.7, 1);

    // Ambient silence floor (< 0.025) must NOT be amplified into false speech
    const ambientSilence = new Array(8000).fill(0).map((_, i) => 0.002 * Math.sin(i));
    const normSilence = normalizeMicrophonePcm(ambientSilence);
    const silencePeak = Math.max(...normSilence.map((s) => Math.abs(s)));
    expect(silencePeak).toBeLessThan(0.01);

    // 7d. Worst-status severity ordering for Akshara cluster badges
    expect(statusSeverity('correct')).toBeLessThan(statusSeverity('uncertain'));
    expect(statusSeverity('uncertain')).toBeLessThan(statusSeverity('substitution'));
    expect(statusSeverity('substitution')).toBeLessThan(statusSeverity('omission'));
  });

  test('8. Translations include bilingual strings for launch prompt, network notice, and settings', () => {
    expect(TRANSLATIONS.ta.learningModePrompt.networkNoticeBody).toContain('இணைய இணைப்பு');
    expect(TRANSLATIONS.en.learningModePrompt.networkNoticeBody).toContain('network');
    expect(TRANSLATIONS.ta.settingsScreen.learningModeEnableBtn).toBeTruthy();
    expect(TRANSLATIONS.en.settingsScreen.learningModeEnableBtn).toBeTruthy();
  });
});
