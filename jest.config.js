module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  moduleNameMapper: {
    '^expo-print$': '<rootDir>/tests/__mocks__/expo-print.ts',
    '^expo-file-system/legacy$': '<rootDir>/tests/__mocks__/expo-file-system/legacy.ts',
    '^@react-native-async-storage/async-storage$': '<rootDir>/tests/__mocks__/@react-native-async-storage/async-storage.ts',
    '^react-native$': '<rootDir>/tests/__mocks__/react-native.ts',
  },
  testMatch: ['**/tests/**/*.test.(ts|tsx|js)'],
};
