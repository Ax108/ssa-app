# Local release & deployment (Android + iOS)

Build and install store-ready (or sideload) binaries **on your machine**, without EAS cloud builders. For cloud builds, see [deployment-eas.md](./deployment-eas.md).

## Shared prep

```bash
cd Astrax-sadhan-sangha-app
bun install
bun verify
```

Confirm identity in `app.json`:

| Field | Value |
|-------|--------|
| App name | Sadhan Sangha Ashram |
| Android `package` | `com.astrax.sadhansangha` |
| iOS `bundleIdentifier` | `com.astrax.sadhansangha` |
| `expo.version` | bump for each store release |

Bump `expo.version` (and Android `versionCode` / iOS build number when you introduce them via `app.json` or native projects) before each store upload.

Regenerate native projects when config changed:

```bash
bun run prebuild
# or platform-specific:
bunx expo prebuild --clean --platform android
bun run prebuild:ios
```

---

## Android — local

### Debug (dev)

```bash
bun run android
```

Or Gradle via WSL:

```bash
bun run wsl:prebuild-android
bun run build:android:wsl
```

Debug APK (typical Gradle output):

`android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (sideload / internal)

Requires a **release keystore**. Expo/local workflows:

1. Create or obtain a upload/keystore (keep it offline; never commit).
2. Configure signing for the `release` build type (Gradle `signingConfigs` or Expo credentials docs).
3. Build:

```bash
bun run android:release
```

WSL Gradle path:

```bash
bun run build:android:release:wsl
```

Typical output:

`android/app/build/outputs/apk/release/app-release.apk`

Use release APKs for **sideload / QA**. They are not the preferred Play Store artifact.

### Release AAB (Google Play)

Play Console expects an **Android App Bundle (`.aab`)**, not only an APK.

From the generated `android/` project (after signing is configured):

```bash
cd android
./gradlew bundleRelease
```

On Windows without WSL, use `gradlew.bat bundleRelease`.

Typical output:

`android/app/build/outputs/bundle/release/app-release.aab`

Upload that AAB in Play Console (internal testing → production as your process requires).

### Android checklist

- [ ] `bun verify` green
- [ ] Version bumped
- [ ] Release signing configured
- [ ] APK for sideload **or** AAB for Play
- [ ] Smoke-test on a physical device (CDN load, tabs, Linking for tel/mailto/maps)

---

## iOS — local (macOS only)

You cannot produce a proper iOS release IPA from Windows alone. Use a Mac with Xcode, or use [EAS](./deployment-eas.md).

### Steps

1. Prebuild iOS:

```bash
bun run prebuild:ios
```

2. Install pods (from `ios/` if not already done by Expo):

```bash
cd ios && pod install && cd ..
```

3. Open the workspace in Xcode:

```bash
open ios/*.xcworkspace
```

4. Select the **Sadhan Sangha Ashram** / `com.astrax.sadhansangha` target.
5. Set **Signing & Capabilities** → your Apple Team (development or distribution).
6. For App Store / TestFlight:
   - Scheme: Release
   - Product → Archive
   - Distribute App → App Store Connect / Ad Hoc / Enterprise as needed

### Simulator vs device

```bash
bun run ios
```

builds and runs a **dev** client on simulator/device. Store archives must go through Xcode Organizer (or `xcodebuild`/`fastlane`) with a **distribution** profile.

### iOS checklist

- [ ] Mac + Xcode + valid Apple Developer Program membership
- [ ] Bundle id matches `com.astrax.sadhansangha`
- [ ] Privacy / usage strings present if you add restricted APIs later
- [ ] Archive uploaded to App Store Connect
- [ ] TestFlight smoke test (CDN, tabs, external links)

---

## Local vs store summary

| Goal | Android | iOS |
|------|---------|-----|
| Daily development | `bun run android` | `bun run ios` (Mac) |
| QA sideload | Release APK | Ad Hoc / TestFlight |
| Store upload | **AAB** via Play Console | Archive → App Store Connect |
| No Mac available | Local Android OK | Use **EAS** cloud iOS builders |

## Credentials safety

- Never commit keystores, `google-services` secrets, or provisioning profiles.
- Prefer password managers / CI secrets for release keys.
- Document who owns the Play Console and Apple Developer accounts separately from this repo.
