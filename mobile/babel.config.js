module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Reanimated 4 ships worklets; a separate worklets plugin duplicates the transform and breaks ESLint/babel parse.
  plugins: ['react-native-reanimated/plugin'],
};
