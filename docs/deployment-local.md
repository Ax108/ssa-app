# Local release & deployment (Android + iOS)

Build store-ready binaries **on your machine** (no EAS cloud builders). Optional cloud path: [deployment-eas.md](./deployment-eas.md).

**Both platforms are first-class.** Shipping Android-only today does not remove iOS support — the same app builds for iOS on a Mac with the steps below.

| Platform | Local store machine | Store artifact |
|----------|---------------------|----------------|
| Android | Windows or macOS | **`.aab`** → Google Play |
| iOS | **macOS + Xcode only** | Archive / IPA → App Store Connect |

---

## Which file does each store need?

| Store | Artifact | How this doc produces it |
|-------|----------|--------------------------|
| **Google Play** | Android App Bundle **`.aab`** | `./gradlew bundleRelease` (not APK) |
| **App Store / TestFlight** | Distribution archive → upload via Xcode Organizer | Product → Archive → Distribute App |

| Not for store upload | Use instead |
|----------------------|-------------|
| Debug / release **APK** | Sideload / internal QA only |
| Simulator iOS build | Local QA only |

---

## Shared prep

```bash
cd ssa-app   # https://github.com/Ax108/ssa-app
bun install
bun verify
```

### App identity (`app.json`)

| Field | Value |
|-------|--------|
| App name | Sadhan Sangha Ashram |
| Android `package` | `com.astrax.sadhansangha` |
| iOS `bundleIdentifier` | `com.astrax.sadhansangha` |
| `expo.version` | Bump for each **store** release; keep `package.json` `version` equal |

JS-only fixes after a binary ships: do **not** bump version — use OTA ([ota-self-host.md](./ota-self-host.md)).

### OTA URL (automatic per prebuild script)

`app.config.js` bakes:

`https://astrarudra.github.io/ssa-static/prod/mobile-app-ota/{android|ios}/manifest.json`

| Command | OTA platform baked in |
|---------|------------------------|
| `bun run prebuild:android` | **android** (`OTA_PLATFORM=android` set by the script) |
| `bun run prebuild:ios` | **ios** (script sets `OTA_PLATFORM=ios`; **macOS only**, skips on Windows) |
| `bun run prebuild` | Android, then iOS (iOS step no-ops on non-Mac) |

You do **not** need `OTA_PLATFORM` in `.env`. Do **not** put a fixed `OTA_PLATFORM` in `.env` — it would force one platform for every config load.

Resolution order in `app.config.js`: script/env `OTA_PLATFORM` → `EAS_BUILD_PLATFORM` → CLI `--platform` → default `android`.

### Config plugins — what runs where

| Plugin | Android prebuild | iOS prebuild |
|--------|------------------|--------------|
| `withAndroidReleaseSigning` (`.env` upload key) | Yes | No (Android-only) |
| `withAndroidLinkingQueries` | Yes | No — iOS uses `ios.infoPlist.LSApplicationQueriesSchemes` in `app.json` |
| `withGradleJvmArgs` | Yes | No |
| `expo-splash-screen` / `expo-font` / `expo-image` / `expo-updates` | Yes | Yes |

**iOS has no `.env` keystore plugin.** Apple signing is done in **Xcode** (team + distribution cert / profile), not via Gradle.

### Regenerate native projects

```bash
bun run prebuild:android   # Windows or Mac — Play / Android work
bun run prebuild:ios       # Mac only — App Store work
bun run prebuild           # android then ios (ios skipped on Windows)
```

Do **not** hand-edit `android/` or `ios/` for product features. Change `app.json` / plugins, then prebuild.

**CNG:** `prebuild --clean` regenerates natives. Android Play signing is re-injected from `.env` via `withAndroidReleaseSigning`.

---

## Android — Google Play (`.aab`)

Goal: a **signed** `app-release.aab` to upload in Play Console.

Requires: JDK 17 (for `keytool` + Gradle), Android SDK / Android Studio as used for local Android builds.

### Step 1 — Version bump

Bump `app.json` → `expo.version` and `package.json` → `version` (same string) for a store release.

For **local** Play uploads, also ensure `android.versionCode` in `app.json` (Expo maps it into Gradle) is higher than any AAB already on Play. First upload can use `1`.

### Step 2 — Upload keystore + `.env` (once per machine)

Google Play requires a release **upload keystore**. Never commit it or `.env`.

**Create a keystore** (once):

```bash
mkdir -p credentials
keytool -genkeypair -v -storetype PKCS12 \
  -keystore credentials/upload-keystore.keystore \
  -alias my-key-alias \
  -keyalg RSA -keysize 2048 -validity 10000
```

**Configure secrets** — copy `.env.example` → `.env` and fill:

```properties
ANDROID_UPLOAD_STORE_FILE=./credentials/upload-keystore.keystore
ANDROID_UPLOAD_KEY_ALIAS=my-key-alias
ANDROID_UPLOAD_STORE_PASSWORD=********
ANDROID_UPLOAD_KEY_PASSWORD=********
```

`ANDROID_UPLOAD_STORE_FILE` may be absolute or relative to the **repo root**.

The config plugin `plugins/android/withAndroidReleaseSigning.js` reads these on every Android prebuild, copies the keystore into `android/app/`, writes `MYAPP_UPLOAD_*` into `gradle.properties`, and sets `signingConfigs.release`. **Do not hand-edit `android/` for signing.**

If `.env` keys are missing, prebuild still succeeds (debug signing) — release/Play AABs will not be correctly signed until `.env` is complete.

Back up `.env` and `credentials/` offline — required for every future Play update with the same upload key.

### Step 3 — Prebuild (OTA + signing)

```bash
bun run prebuild:android
```

This sets `OTA_PLATFORM=android` automatically and injects release signing from `.env`.

Confirm logs include `[withAndroidReleaseSigning] Injected signingConfigs.release` (not the skip warning).

### Step 4 — Build the AAB

```bash
cd android
./gradlew bundleRelease
# Windows (no WSL): gradlew.bat bundleRelease
```

**Output file (upload this):**

`android/app/build/outputs/bundle/release/app-release.aab`

### Step 5 — Upload to Google Play Console

1. Open [Google Play Console](https://play.google.com/console) → app with package `com.astrax.sadhansangha`.
2. **Release** → choose a track (**Internal testing** recommended first).
3. **Create new release** → upload `app-release.aab`.
4. Add release notes → review → roll out.
5. Promote Internal → Closed/Open → Production when ready.

First listing also needs store listing, content rating, privacy policy, and related Play Console setup.

### Android APK (sideload / QA only — not Play)

```bash
bun run android:release
# or: cd android && ./gradlew assembleRelease
```

Typical path: `android/app/build/outputs/apk/release/app-release.apk`

### Android checklist

- [ ] `bun verify` green
- [ ] `expo.version` / `package.json` version bumped (store release only)
- [ ] `android.versionCode` higher than last Play upload (if any)
- [ ] `.env` + keystore configured; `bun run prebuild:android` injected signing
- [ ] `bundleRelease` produced **`app-release.aab`**
- [ ] AAB uploaded in Play Console
- [ ] Physical-device smoke test (CDN, tabs, donate, tel/mailto/maps)
- [ ] OTA published for android (or `ota:export:all`) — [ota-self-host.md](./ota-self-host.md)

---

## iOS — App Store / TestFlight (macOS only)

Goal: a **distribution-signed** archive uploaded to App Store Connect (TestFlight → App Review → release).

**Windows cannot produce a store IPA.** Use a Mac with Xcode for this section (EAS is optional and not required).

Requires: **macOS**, Xcode (latest stable), CocoaPods, **Apple Developer Program** membership, App Store Connect access for the app.

### What is already configured in the repo (no Android-style `.env` key)

| Item | Where |
|------|--------|
| Bundle id | `app.json` → `ios.bundleIdentifier` = `com.astrax.sadhansangha` |
| Linking schemes (https/tel/mailto) | `app.json` → `ios.infoPlist.LSApplicationQueriesSchemes` |
| OTA URL for iOS binary | `bun run prebuild:ios` sets `OTA_PLATFORM=ios` automatically |
| Splash / fonts / image / updates | Shared Expo plugins (same as Android) |

Apple **distribution certificates and provisioning profiles** are **not** in git. Xcode (or the Apple Developer portal) creates them when you sign in with the team that owns the app.

### Step 1 — Version bump

On the Mac, same as Android: bump `app.json` → `expo.version` and `package.json` → `version` (same string).

Optionally set `ios.buildNumber` in `app.json` if App Store Connect requires a higher build than the last upload (string, e.g. `"1"`, `"2"`).

### Step 2 — Prebuild (bakes iOS OTA URL)

```bash
bun install
bun verify
bun run prebuild:ios
```

`prebuild:ios` sets `OTA_PLATFORM=ios` so `updates.url` points at  
`…/mobile-app-ota/ios/manifest.json` — you do not set this in `.env`.

Confirm `ios/` exists at the repo root after the command.

### Step 3 — CocoaPods

```bash
cd ios && pod install && cd ..
```

If `pod` is missing: install CocoaPods (`sudo gem install cocoapods` or Homebrew), then retry.

### Step 4 — Open Xcode workspace

```bash
open ios/*.xcworkspace
```

Use the **`.xcworkspace`**, not the `.xcodeproj`.

### Step 5 — Signing (distribution) in Xcode

1. Select the project → target **Sadhan Sangha Ashram** (bundle id `com.astrax.sadhansangha`).
2. **Signing & Capabilities**:
   - Team = your **Apple Developer** team
   - Enable **Automatically manage signing** (typical), or install a matching **App Store** provisioning profile manually
3. For store archives, the signing certificate must be **Apple Distribution** (Development-only is not enough for App Store upload).
4. Resolve any bundle-id / capability errors Xcode shows before archiving.

There is no Gradle keystore step on iOS. Do **not** expect `withAndroidReleaseSigning` to run here.

### Step 6 — Archive (store binary)

1. Scheme: app scheme in **Release** configuration.
2. Destination: **Any iOS Device (arm64)** — **not** a Simulator.
3. Menu: **Product → Archive**.
4. Wait until **Organizer** opens with the new archive.

### Step 7 — Distribute to App Store Connect

1. Organizer → select the archive → **Distribute App**.
2. Choose **App Store Connect** → **Upload** (or Export IPA for a later Transporter upload).
3. Follow the signing / destination prompts.
4. In [App Store Connect](https://appstoreconnect.apple.com): wait for processing → add build to **TestFlight** → smoke-test → submit for **App Review** when ready.

Official walkthrough: [Expo — Manually submit an iOS app](https://docs.expo.dev/submit/ios-manual/).

### Debug on Mac (not for store)

```bash
bun run prebuild:ios
bun run ios
bun run start   # Metro with expo-dev-client, if used
```

### iOS checklist (use this on Mac release day)

- [ ] Mac + Xcode + Apple Developer Program + App Store Connect access
- [ ] `bun verify` green
- [ ] `expo.version` / `package.json` version bumped (store release only)
- [ ] `bun run prebuild:ios` completed (OTA URL is iOS automatically)
- [ ] `pod install` succeeded
- [ ] Opened **`.xcworkspace`**
- [ ] Bundle id `com.astrax.sadhansangha`; distribution signing OK
- [ ] Archive from **Any iOS Device** (not simulator)
- [ ] Uploaded to App Store Connect / TestFlight
- [ ] TestFlight smoke test (CDN, tabs, donate, tel/mailto/maps)
- [ ] Privacy / usage strings updated if new restricted APIs were added
- [ ] OTA published for ios (or `ota:export:all`) — [ota-self-host.md](./ota-self-host.md)

---

## After either store binary ships

Publish JS OTA for the **same** `expo.version`. If both stores are live, export **both** platforms:

```bash
bun run ota:export:all
# commit + push astrarudra/ssa-static (main → release for GitHub Pages)
```

Android-only for now: `bun run ota:export:android` is enough until the first iOS binary ships; then use `:all`.

See [ota-self-host.md](./ota-self-host.md).

---

## Summary

| Goal | Android | iOS |
|------|---------|-----|
| Daily development | `bun run android` | `bun run ios` (macOS) |
| Prebuild + correct OTA URL | `bun run prebuild:android` | `bun run prebuild:ios` |
| Release signing | `.env` + Android plugin | Xcode Apple Distribution |
| QA sideload | Release APK | Ad Hoc / TestFlight |
| Store upload | **`.aab`** → Play Console | Archive → App Store Connect |
| No Mac | Local Android OK | Need a Mac (or optional EAS) |
| JS-only update | OTA | OTA (export matching platforms) |

---

## Credentials safety

- Never commit keystores (`.keystore` / `.jks`), `.env`, `credentials.json`, provisioning profiles, or distribution `.p12` files.
- Android: `.env` + `credentials/` + `withAndroidReleaseSigning` (back up offline).
- iOS: Apple team certs/profiles live in Keychain / Apple Developer — document who owns the team outside this repo.
