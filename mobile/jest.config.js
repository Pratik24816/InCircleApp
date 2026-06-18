const rnPreset = require('@react-native/jest-preset/jest-preset');

module.exports = {
  ...rnPreset,
  setupFiles: [
    require.resolve('react-native-gesture-handler/jestSetup'),
    ...rnPreset.setupFiles,
  ],
  setupFilesAfterEnv: [
    ...(rnPreset.setupFilesAfterEnv || []),
    '<rootDir>/jest.setup-after-env.js',
  ],
  // Preset ignores most of node_modules; RNGH (and navigation) ship ESM and must be transformed.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|react-native-gesture-handler|@react-navigation|react-native-reanimated|react-native-worklets|@tanstack/react-query)',
  ],
};
