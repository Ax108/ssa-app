# Local release & deployment (Android + iOS)

Build store-ready binaries **on your machine** (no EAS cloud builders). For cloud AAB/IPA, see [deployment-eas.md](./deployment-eas.md).

**Platforms covered:** Android (Google Play) and iOS (App Store / TestFlight). iOS archives require **macOS + Xcode** (or use EAS).

---

## Which file does each store need?

| Store | Artifact | How this doc produces it |
|-------|----------|--------------------------|
| **Google Play** | Android App Bundle **`.aab`** | `./gradlew bundleRelease` (not APK) |
| **App Store / TestFlight** | Signed archive → **IPA** via Xcode Organizer | Product → Archive → Distribute App |

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

### OTA URL when prebuilding

`app.config.js` bakes a platform-specific Pages manifest URL.

| Goal | Command / env |
|------|----------------|
| Android binary checks Android OTA | `OTA_PLATFORM=android bun run prebuild:android` (or default `android`) |
| iOS binary checks iOS OTA | `OTA_PLATFORM=ios bun run prebuild:ios` |
| EAS cloud builds | `EAS_BUILD_PLATFORM` set automatically — [deployment-eas.md](./deployment-eas.md) |

### Regenerate native projects

```bash
bun run prebuild              # both (ios/ useful on macOS)
bun run prebuild:android
bun run prebuild:ios          # macOS
```

Do **not** hand-edit `android/` or `ios/` for product features. Change `app.json` / plugins, then prebuild.

**CNG note:** `prebuild --clean` regenerates native folders. Android Play signing is re-injected automatically from `.env` via `withAndroidReleaseSigning` — no manual `android/` edits for signing.

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

### Step 3 — Prebuild (injects signing)

```bash
OTA_PLATFORM=android bun run prebuild:android
```

Confirm the plugin logged that release signing was injected (not the “Skipping release signing” warning).

### Step 4 — Build the AAB

From the repo root:

```bash
cd android
./gradlew bundleRelease
# Windows (no WSL): gradlew.bat bundleRelease
```

**Output file (upload this):**

`android/app/build/outputs/bundle/release/app-release.aab`

If the build fails with signing / keystore errors, re-check `.env` and re-run prebuild.

Official reference: [Expo — Create a release build locally](https://docs.expo.dev/guides/local-app-production/).

### Step 5 — Upload to Google Play Console

1. Open [Google Play Console](https://play.google.com/console) → app with package `com.astrax.sadhansangha`.
2. **Release** → choose a track (**Internal testing** recommended first).
3. **Create new release** → upload `app-release.aab`.
4. Add release notes → review → roll out.
5. Promote Internal → Closed/Open → Production when ready.

First listing also needs store listing, content rating, privacy policy, and related Play Console setup.

### Android APK (sideload / QA only — not Play)

After the same signing setup:

```bash
bun run android:release
# or: cd android && ./gradlew assembleRelease
```

Typical path: `android/app/build/outputs/apk/release/app-release.apk`

### Android checklist

- [ ] `bun verify` green
- [ ] `expo.version` / `package.json` version bumped (store release only)
- [ ] `OTA_PLATFORM=android` prebuild completed
- [ ] Upload keystore + `.env` configured; prebuild injected release signing
- [ ] `bundleRelease` produced **`app-release.aab`**
- [ ] AAB uploaded in Play Console
- [ ] Physical-device smoke test (CDN, tabs, donate, tel/mailto/maps)
- [ ] Matching OTA published ([ota-self-host.md](./ota-self-host.md))

---

## iOS — App Store / TestFlight (macOS only)

Goal: a **distribution-signed** archive uploaded to App Store Connect (TestFlight → App Review → release).

Windows cannot produce a store IPA locally. Use a Mac + Xcode, or **EAS** ([deployment-eas.md](./deployment-eas.md)).

Requires: Apple Developer Program membership, Xcode, CocoaPods.

### Step 1 — Version + prebuild

1. Bump `app.json` → `expo.version` and `package.json` → `version` (same string).
2. Generate natives with the iOS OTA URL:

```bash
OTA_PLATFORM=ios bun run prebuild:ios
```

### Step 2 — CocoaPods

```bash
cd ios && pod install && cd ..
```

### Step 3 — Open Xcode workspace

```bash
open ios/*.xcworkspace
```

Use the **`.xcworkspace`**, not the `.xcodeproj`.

### Step 4 — Signing (distribution)

1. Select target **Sadhan Sangha Ashram** / bundle id `com.astrax.sadhansangha`.
2. **Signing & Capabilities** → Team = Apple Developer team.
3. Enable **Automatically manage signing** (or install a matching **App Store / Distribution** provisioning profile).
4. Confirm the signing certificate is **Apple Distribution** (not Development-only) for store archives.

### Step 5 — Archive

1. Scheme: **Release** (or the app scheme configured for Release).
2. Destination: **Any iOS Device (arm64)** — not a simulator.
3. **Product → Archive**.
4. Wait for Organizer to open with the new archive.

### Step 6 — Distribute to App Store Connect

1. In Organizer → select the archive → **Distribute App**.
2. Choose **App Store Connect** → Upload (or Export IPA for a later upload).
3. Follow prompts (distribution options, signing).
4. After processing in App Store Connect, assign the build to **TestFlight**, smoke-test, then submit for **App Review** when ready.

Official reference: [Expo — Manually submit an iOS app](https://docs.expo.dev/submit/ios-manual/).

### Debug (simulator / device) — not for store

```bash
OTA_PLATFORM=ios bun run prebuild:ios
bun run ios
bun run start   # Metro, if using dev-client
```

### iOS checklist

- [ ] Mac + Xcode + Apple Developer Program membership
- [ ] `bun verify` green
- [ ] `expo.version` / `package.json` version bumped (store release only)
- [ ] `OTA_PLATFORM=ios` prebuild completed
- [ ] Bundle id `com.astrax.sadhansangha`
- [ ] Distribution signing configured
- [ ] Archive uploaded to App Store Connect
- [ ] TestFlight smoke test (CDN, tabs, donate, tel/mailto/maps)
- [ ] Privacy / usage strings updated if new restricted APIs are added
- [ ] Matching OTA published ([ota-self-host.md](./ota-self-host.md))

---

## After either store binary ships

Publish JS OTA for the **same** `expo.version` on both platforms when both stores are in use:

```bash
bun run ota:export:all
# commit + push astrarudra/ssa-static (main → release for GitHub Pages)
```

See [ota-self-host.md](./ota-self-host.md).

---

## Summary

| Goal | Android | iOS |
|------|---------|-----|
| Daily development | `bun run android` | `bun run ios` (macOS) |
| QA sideload | Release APK | Ad Hoc / TestFlight |
| Store upload | **`.aab`** → Play Console | Archive → App Store Connect |
| No Mac | Local Android OK | Use **EAS** for IPA |
| JS-only update | OTA — [ota-self-host.md](./ota-self-host.md) | Same (export **both** platforms) |

---

## Credentials safety

- Never commit keystores (`.keystore` / `.jks`), `.env`, `credentials.json`, provisioning profiles, or distribution `.p12` files.
- Prefer `.env` + `plugins/android/withAndroidReleaseSigning.js` for Android release signing (see above).
- Document Play Console and Apple Developer account owners outside this repo.
