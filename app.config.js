/** Public GitHub Pages base for self-hosted Expo Updates (ssa-static). */
const OTA_CDN_BASE =
  "https://astrarudra.github.io/ssa-static/prod/mobile-app-ota";

/**
 * Resolve which OTA folder to bake into `updates.url`.
 *
 * Order:
 * 1. `OTA_PLATFORM` — set by `prebuild:android` / `prebuild:ios` package scripts
 * 2. `EAS_BUILD_PLATFORM` — set by EAS Build cloud jobs
 * 3. Infer `--platform ios|android` / `-p ios|android` from process.argv
 * 4. Default `android`
 *
 * Always use platform-specific prebuild scripts for store binaries so each
 * native tree gets the matching Pages URL.
 *
 * @returns {"android" | "ios"}
 */
function resolveOtaPlatform() {
  const fromEnv = (
    process.env.OTA_PLATFORM ||
    process.env.EAS_BUILD_PLATFORM ||
    ""
  ).toLowerCase();
  if (fromEnv === "ios" || fromEnv === "android") {
    return fromEnv;
  }

  const args = process.argv.join(" ").toLowerCase();
  if (
    /--platform(?:=|\s+)ios\b/.test(args) ||
    /\s-p(?:=|\s+)ios\b/.test(args)
  ) {
    return "ios";
  }
  if (
    /--platform(?:=|\s+)android\b/.test(args) ||
    /\s-p(?:=|\s+)android\b/.test(args)
  ) {
    return "android";
  }

  return "android";
}

/**
 * Dynamic config — Expo loads `app.json` into `config`, then we layer OTA fields.
 *
 * GH Pages cannot branch on `expo-platform` request headers, so each native binary
 * is pointed at a platform-specific manifest URL (flat — no version subfolders).
 *
 * @param {{ config: import('expo/config').ExpoConfig }} ctx
 * @returns {import('expo/config').ExpoConfig}
 */
module.exports = ({ config }) => {
  const otaPlatform = resolveOtaPlatform();
  const updatesUrl = `${OTA_CDN_BASE}/${otaPlatform}/manifest.json`;
  const plugins = [...(config.plugins || [])];
  if (!plugins.includes("expo-updates")) {
    plugins.push("expo-updates");
  }

  return {
    ...config,
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      enabled: true,
      // React owns background check/fetch; Expo launches cached updates on cold start.
      checkAutomatically: "NEVER",
      fallbackToCacheTimeout: 0,
      url: updatesUrl,
    },
    plugins,
  };
};
