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

**CNG note:** `prebuild --clean` regenerates native folders. Re-apply Android signing edits after each clean prebuild (or keep passwords in `~/.gradle/gradle.properties` outside the repo).

---

## Android — Google Play (`.aab`)

Goal: a **signed** `app-release.aab` to upload in Play Console.

Requires: JDK 17 (for `keytool` + Gradle), Android SDK / Android Studio as used for local Android builds.

### Step 1 — Version + prebuild

1. Bump `app.json` → `expo.version` and `package.json` → `version` (same string).
2. Generate natives with the Android OTA URL:

```bash
OTA_PLATFORM=android bun run prebuild:android
```

Confirm `android/` exists at the repo root.

### Step 2 — Upload keystore (once per app)

Google Play requires a release **upload keystore**. Never commit it.

**Option A — Create a new keystore**

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore my-upload-key.keystore \
  -alias my-key-alias \
  -keyalg RSA -keysize 2048 -validity 10000
```

Move `my-upload-key.keystore` into `android/app/` (generated folder; already gitignored via `/android`).

**Option B — Reuse an existing Play / EAS keystore**

If credentials already live on EAS:

```bash
bunx eas-cli@latest credentials -p android
```

Download to `credentials.json`, place the `.jks` / `.keystore` under `android/app/`, and use the documented alias + passwords in the next step. Do not commit `credentials.json`.

Store passwords and the keystore file in a password manager. Losing the upload key complicates Play updates.

### Step 3 — Gradle signing properties

Add to **`android/gradle.properties`** (or prefer **`~/.gradle/gradle.properties`** so clean prebuilds do not wipe secrets):

```properties
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=********
MYAPP_UPLOAD_KEY_PASSWORD=********
```

Replace filenames, alias, and passwords with the values from Step 2.

### Step 4 — Wire `signingConfigs` in `android/app/build.gradle`

In the generated `android/app/build.gradle`:

1. Inside `android { signingConfigs { ... } }`, add a `release` block (keep existing `debug`):

```gradle
release {
    if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
        storeFile file(MYAPP_UPLOAD_STORE_FILE)
        storePassword MYAPP_UPLOAD_STORE_PASSWORD
        keyAlias MYAPP_UPLOAD_KEY_ALIAS
        keyPassword MYAPP_UPLOAD_KEY_PASSWORD
    }
}
```

2. Under `buildTypes { release { ... } }`, set:

```gradle
signingConfig signingConfigs.release
```

(Default Expo templates often point release at `signingConfigs.debug` — change that for store builds.)

Re-apply this after every `prebuild --clean`.

Official reference: [Expo — Create a release build locally](https://docs.expo.dev/guides/local-app-production/).

### Step 5 — Build the AAB

From the repo root:

```bash
cd android
./gradlew bundleRelease
# Windows (no WSL): gradlew.bat bundleRelease
```

**Output file (upload this):**

`android/app/build/outputs/bundle/release/app-release.aab`

If the build fails with signing / keystore errors, re-check Steps 2–4. An unsigned or debug-signed AAB will be rejected by Play.

### Step 6 — Upload to Google Play Console

1. Open [Google Play Console](https://play.google.com/console) → app with package `com.astrax.sadhansangha`.
2. **Release** → choose a track (**Internal testing** recommended first).
3. **Create new release** → upload `app-release.aab`.
4. Add release notes → review → roll out.
5. Promote Internal → Closed/Open → Production when ready.

First listing also needs store listing, content rating, privacy policy, and related Play Console setup.

Optional: submit a local AAB via EAS without rebuilding:  
`bunx eas-cli@latest submit -p android --path ./android/app/build/outputs/bundle/release/app-release.aab`

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
- [ ] Upload keystore + Gradle `signingConfigs.release` configured
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

- Never commit keystores (`.keystore` / `.jks`), `credentials.json`, provisioning profiles, or distribution `.p12` files.
- Prefer `~/.gradle/gradle.properties` (or a password manager) over committing secrets inside `android/`.
- Document Play Console and Apple Developer account owners outside this repo.
- Prefer EAS-managed credentials if the team later switches to [deployment-eas.md](./deployment-eas.md) — keep one source of truth for the upload key.
