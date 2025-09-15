const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = getDefaultConfig(__dirname);

const customConfig = {
  resolver: {
    assetExts: [...config.resolver.assetExts, 'bin', 'txt', 'jpg', 'png', 'json', 'gif', 'webp', 'svg'],
  },
};

module.exports = mergeConfig(config, customConfig);
