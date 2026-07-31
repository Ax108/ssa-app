# Self-hosted JS OTA (ssa-static)

The app uses **`expo-updates`** with updates hosted on the same GitHub Pages CDN as content:

`https://astrarudra.github.io/ssa-static/prod/mobile-app-ota/`

Folder layout and publish notes live in the static repo: `ssa-static/prod/mobile-app-ota/README.md` (served from GitHub Pages on the **`release`** branch).

This does **not** require an EAS Update subscription. Native store binaries may be built **locally** ([deployment-local.md](./deployment-local.md) — Play AAB via `.env` signing + `bundleRelease`) or optionally with **EAS Build** ([deployment-eas.md](./deployment-eas.md)); only the **JS update host** is custom. Content JSON (`config` / locale packs) remains on the separate gist + `prod/json/` pipeline.

Do **not** configure EAS Update channels or change `updates.url` to Expo’s servers.

## Versioning (`app.json` vs `package.json`)

| File | Field | Role for OTA |
|------|--------|----------------|
| **`app.json`** | `expo.version` (e.g. `1.0.0`) | **Source of truth for OTA.** `app.config.js` sets `runtimeVersion.policy: "appVersion"`, so the native binary and every published OTA manifest must share this same string. |
| **`package.json`** | `version` | npm / repo versioning only. Expo Updates does **not** read it. Keep it equal to `expo.version` by convention so humans don’t get confused. |

Rules:

- **JS-only OTA** — do **not** bump `expo.version`. Export and publish under the same runtime (e.g. still `1.0.0`). Store binaries already on that version will pick up the new JS.
- **Native / store release** — bump **both** `app.json` → `expo.version` and `package.json` → `version` together (e.g. `1.0.0` → `1.0.1` or `1.1.0`), rebuild + submit to the store, **and** publish a matching OTA so the CDN has a bundle for the new runtime (see below).

Optional Android/iOS store build numbers (`android.versionCode`, `ios.buildNumber`) are **not** OTA `runtimeVersion`. For optional EAS with `"appVersionSource": "remote"`, EAS owns those integers — see [deployment-eas.md](./deployment-eas.md). For **local** Android AABs, set / bump `android.versionCode` in `app.json` (or the generated Gradle values) when Play requires a higher version code than the previous upload.

## App config

`app.config.js` (dynamic; Expo passes `app.json` as `config`) sets:

| Field | Value |
|-------|--------|
| `runtimeVersion.policy` | `appVersion` → equals `expo.version` |
| `updates.url` | `…/mobile-app-ota/{android\|ios}/manifest.json` |
| `updates.checkAutomatically` | `ON_LOAD` |
| plugin | `expo-updates` |

Platform selection for the baked URL (evaluated each time Expo loads config):

1. **`OTA_PLATFORM=android|ios`** — local prebuild / release override  
2. **`EAS_BUILD_PLATFORM`** — set automatically by **EAS Build** cloud jobs  
3. Default **`android`**

GitHub Pages cannot switch on `expo-platform` request headers, so each store binary points at one platform folder under `prod/mobile-app-ota/{android|ios}/`.

## Runtime behaviour

`src/shared/ota/updatesController.ts` → `syncOtaUpdate()`:

1. Skips quietly when `Updates.isEnabled` is false (typical Metro / Expo Go / many debug builds)
2. Otherwise `checkForUpdateAsync` → if available → `fetchUpdateAsync`
3. Does **not** reload by default (update applies on the **next cold start**)
4. Unexpected failures are logged via `logger.warn`; “not supported in development” is `logger.debug` + skipped

Called from `App.tsx` during the custom splash gate (same as content/fonts): splash stays up until `syncOtaUpdate()` finishes. Downloaded updates still apply on the **next cold start** by default.

All OTA messages go through `src/shared/utils/logger.ts` (no-op when `__DEV__` is false / release).

### Dev note (Metro vs binary)

- **Metro connected** (`bun start` + live reload): your machine’s JS still wins for local editing. OTA may check/fetch in the background, but you will not “become” someone else’s bundle while Metro is serving.
- **To actually run a teammate’s OTA**: open the **dev-client / debug / release binary without Metro** (same `expo.version`). Debug natives often need updates enabled at build time, e.g. `EXPO_UPDATES_NATIVE_DEBUG=1` when prebuilding/running Android/iOS debug, otherwise `expo-updates` may report disabled and the sync fails softly.

## Publish scripts (`package.json`)

| Script | Platforms | Writes to |
|--------|-----------|-----------|
| `bun run ota:export:android` | Android | `ssa-static/prod/mobile-app-ota/android/` |
| `bun run ota:export:ios` | iOS | `ssa-static/prod/mobile-app-ota/ios/` |
| `bun run ota:export:all` | Android then iOS | both folders above |
| `bun run ota:export -- --platform android\|ios` | one (low-level) | same; supports extra flags e.g. `--out …` |

`ssa-static` hosts **both** platform trees under one CDN path; you still export per platform because the JS/Hermes bundles differ. Prefer `:all` when you ship Android and iOS binaries.

## After changing code in development — publish a new OTA

1. Develop and verify locally (Metro is fine).
2. Decide whether the change is **JS-only** or needs **native** (next section).
3. From this app repo ([Ax108/ssa-app](https://github.com/Ax108/ssa-app)). Default export path assumes a local clone of [astrarudra/ssa-static](https://github.com/astrarudra/ssa-static) next to it (override with `--out`):

```bash
bun run ota:export:android   # Android only
bun run ota:export:ios       # iOS only
bun run ota:export:all       # both (recommended when you support both stores)
```

4. Commit and push the staged files in your [astrarudra/ssa-static](https://github.com/astrarudra/ssa-static) clone:

```bash
cd ../ssa-static   # or wherever you cloned astrarudra/ssa-static
git checkout main   # or release for Pages; keep them in sync after publish
git add prod/mobile-app-ota
git commit -m "## Publish mobile OTA bundles"
git push
# if Pages deploys from release: merge main → release and push release
```

5. Wait for GitHub Pages to update.
6. Teammates open a binary built with the **same** `expo.version` (ideally without Metro). On load the app checks the CDN, downloads the update, and applies it on the **next cold start**.

## When OTA is enough vs when you need a store build

### JS-only (ship via OTA)

UI, screens, store helpers, assets in the JS bundle, copy changes, bugfixes that do not add native modules.

- Keep `expo.version` / `package.json` version unchanged.
- Run `ota:export:android`, `ota:export:ios`, or `ota:export:all`, then push `ssa-static`.
- Users on an existing store binary with that runtime get the new JS without a Play Store / App Store update.

### Native change (store update required)

Examples: new Expo/React Native packages with native code, new config plugins, `expo prebuild` / `android`/`ios` native changes, Expo SDK upgrade, first-time enable of `expo-updates` / change of `updates.url`.

OTA **cannot** install new native code into an old binary. You must:

1. Bump **`app.json` `expo.version`** and **`package.json` `version`** to the new runtime (e.g. `1.0.1`).
2. Rebuild and submit **new store binaries for Android and iOS** (EAS or local — [deployment-eas.md](./deployment-eas.md) / [deployment-local.md](./deployment-local.md)).
3. **Still publish JS OTA for both platforms** for that new runtime: `bun run ota:export:all` and push `ssa-static` so each of `android/` and `ios/` has `manifest.json` / bundles under the new `runtimeVersion`. Otherwise new installs only have the embedded bundle until the first OTA publish.

Old binaries keep using the **previous** runtime’s OTA folder entry (same URL path, but the manifest’s `runtimeVersion` must match; clients ignore updates for a different runtime). After a bump, publish OTA for the **new** version; leave or overwrite platform folders according to your publish script (one active manifest per platform URL).

## Tests

`src/tests/updatesController.test.ts` mocks `expo-updates` and covers up-to-date / fetch / fail paths.
