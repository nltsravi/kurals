export const requestRecordingPermissionsAsync = jest.fn(async () => ({
  granted: true,
  status: 'granted',
  canAskAgain: true,
  expires: 'never',
}));

export const getRecordingPermissionsAsync = jest.fn(async () => ({
  granted: true,
  status: 'granted',
  canAskAgain: true,
  expires: 'never',
}));

export const setAudioModeAsync = jest.fn(async () => {});

export const RecordingPresets = {
  HIGH_QUALITY: {
    extension: '.m4a',
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    android: { outputFormat: 'mpeg4', audioEncoder: 'aac' },
    ios: { outputFormat: 'aac ', audioQuality: 127 },
    web: { mimeType: 'audio/webm', bitsPerSecond: 128000 },
  },
  LOW_QUALITY: {
    extension: '.m4a',
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 64000,
    android: { outputFormat: '3gp', audioEncoder: 'amr_nb' },
    ios: { outputFormat: 'aac ', audioQuality: 0 },
    web: { mimeType: 'audio/webm', bitsPerSecond: 128000 },
  },
};

export const AudioModule = {
  requestRecordingPermissionsAsync,
  getRecordingPermissionsAsync,
  setAudioModeAsync,
  AudioStream: jest.fn().mockImplementation(() => ({
    id: 'mock-stream-1',
    sampleRate: 16000,
    channels: 1,
    isStreaming: false,
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    start: jest.fn(async () => {}),
    stop: jest.fn(),
  })),
  AudioRecorder: jest.fn().mockImplementation(() => ({
    id: 'mock-recorder-1',
    isRecording: true,
    uri: 'file:///mock/recording.m4a',
    prepareToRecordAsync: jest.fn(async () => {}),
    record: jest.fn(),
    stop: jest.fn(async () => {}),
    getStatus: jest.fn(() => ({
      canRecord: true,
      isRecording: true,
      durationMillis: 1500,
      fileSize: 24000,
      mediaServicesDidReset: false,
      metering: -14,
      url: 'file:///mock/recording.m4a',
    })),
  })),
};

export default AudioModule;

