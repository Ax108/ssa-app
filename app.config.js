/** Public GitHub Pages base for self-hosted Expo Updates (ssa-static). */
const OTA_CDN_BASE =
  "https://astrarudra.github.io/ssa-static/prod/mobile-app-ota";

/**
 * Dynamic config — Expo loads `app.json` into `config`, then we layer OTA fields.
 *
 * OTA platform resolution (evaluated per config load, not at require-time):
 * 1. `OTA_PLATFORM=ios|android` — local prebuild / release override
 * 2. `EAS_BUILD_PLATFORM` — set automatically by EAS Build cloud jobs
 * 3. default `android`
 *
 * GH Pages cannot branch on `expo-platform` headers, so each native binary
 * is pointed at a platform-specific manifest URL.
 *
 * @param {{ config: import('expo/config').ExpoConfig }} ctx
 * @returns {import('expo/config').ExpoConfig}
 */
module.exports = ({ config }) => {
  const otaPlatform = (
    process.env.OTA_PLATFORM ||
    process.env.EAS_BUILD_PLATFORM ||
    "android"
  ).toLowerCase();
  const updatesUrl = `${OTA_CDN_BASE}/${otaPlatform}/manifest.json`;

  return {
    ...config,
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      enabled: true,
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 0,
      url: updatesUrl,
    },
    plugins: [...(config.plugins || []), "expo-updates"],
  };
};
