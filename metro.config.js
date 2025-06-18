const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Add `.tflite` to the assetExts array
defaultConfig.resolver.assetExts.push('tflite');

const config = {
  resolver: {
    assetExts: defaultConfig.resolver.assetExts,
  },
  resetCache: true,
};

module.exports = mergeConfig(defaultConfig, config);
