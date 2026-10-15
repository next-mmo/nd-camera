const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

// Derived from Universal Apps' expo-uniwind template. Keep Uniwind outermost.
const config = getDefaultConfig(__dirname);
module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/index.css',
  dtsFile: './src/uniwind-types.d.ts',
});
