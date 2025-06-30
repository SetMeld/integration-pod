const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  '~': path.resolve(__dirname, 'node_modules/linked-data-browser'),
};

module.exports = withNativeWind(config, { input: './global.css' });
