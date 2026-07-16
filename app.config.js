const appJson = require("./app.json");

/** Public GitHub Pages base for self-hosted Expo Updates (ssa-static). */
const OTA_CDN_BASE =
  "https://astrarudra.github.io/ssa-static/prod/mobile-app-ota";

/**
 * GH Pages cannot branch on `expo-platform` headers, so each native binary
 * is pointed at a platform-specific manifest URL.
 * Override with OTA_PLATFORM=ios|android when prebuilding / releasing.
 */
const otaPlatform = (process.env.OTA_PLATFORM || "android").toLowerCase();
const updatesUrl = `${OTA_CDN_BASE}/${otaPlatform}/manifest.json`;

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  ...appJson.expo,
  runtimeVersion: {
    policy: "appVersion",
  },
  updates: {
    enabled: true,
    checkAutomatically: "ON_LOAD",
    fallbackToCacheTimeout: 0,
    url: updatesUrl,
  },
  plugins: [...(appJson.expo.plugins || []), "expo-updates"],
};
