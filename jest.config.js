module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  moduleNameMapper: {
    '^expo-audio$': '<rootDir>/tests/__mocks__/expo-audio.ts',
    '^expo-print$': '<rootDir>/tests/__mocks__/expo-print.ts',
    '^expo-notifications$': '<rootDir>/tests/__mocks__/expo-notifications.ts',
    '^expo-constants$': '<rootDir>/tests/__mocks__/expo-constants.ts',
    '^expo-file-system/legacy$': '<rootDir>/tests/__mocks__/expo-file-system/legacy.ts',
    '^expo-clipboard$': '<rootDir>/tests/__mocks__/expo-clipboard.ts',
    '^expo-image$': '<rootDir>/tests/__mocks__/expo-image.ts',
    '^expo-sharing$': '<rootDir>/tests/__mocks__/expo-sharing.ts',
    '^react-native-view-shot$': '<rootDir>/tests/__mocks__/react-native-view-shot.ts',
    '^@react-native-async-storage/async-storage$': '<rootDir>/tests/__mocks__/@react-native-async-storage/async-storage.ts',
    '^react-native$': '<rootDir>/tests/__mocks__/react-native.ts',
    '\\.(png|jpg|jpeg|gif|webp|svg)$': '<rootDir>/tests/__mocks__/fileMock.js',
  },
  testMatch: ['**/tests/**/*.test.(ts|tsx|js)'],
};
