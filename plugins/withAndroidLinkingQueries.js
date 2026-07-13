const { withAndroidManifest } = require("expo/config-plugins");

/**
 * Declares Android 11+ package-visibility intents so Linking can open
 * https / tel / mailto (maps, social, phone, email).
 */
function withAndroidLinkingQueries(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const existing = manifest.queries ?? [];
    const linkingQueries = {
      intent: [
        {
          action: [{ $: { "android:name": "android.intent.action.VIEW" } }],
          data: [{ $: { "android:scheme": "https" } }],
        },
        {
          action: [{ $: { "android:name": "android.intent.action.VIEW" } }],
          data: [{ $: { "android:scheme": "http" } }],
        },
        {
          action: [{ $: { "android:name": "android.intent.action.DIAL" } }],
          data: [{ $: { "android:scheme": "tel" } }],
        },
        {
          action: [{ $: { "android:name": "android.intent.action.SENDTO" } }],
          data: [{ $: { "android:scheme": "mailto" } }],
        },
      ],
    };
    manifest.queries = [...existing, linkingQueries];
    return config;
  });
}

module.exports = withAndroidLinkingQueries;
