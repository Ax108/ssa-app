# Local release & deployment (Android + iOS)

Build and install binaries **on your machine** (no EAS cloud builders). For cloud AAB/IPA, see [deployment-eas.md](./deployment-eas.md).

**Platforms covered:** Android and iOS. iOS store archives require **macOS + Xcode** (or use EAS).

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

### OTA URL when prebuilding (required for Updates-enabled binaries)

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

---

## Android — local

### Debug

```bash
bun run android
```

WSL alternative:

```bash
bun run wsl:prebuild-android
bun run build:android:wsl
```

Typical debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (sideload / internal QA)

1. Create or obtain a release keystore (never commit).
2. Configure Gradle `signingConfigs` for the `release` build type.
3. Regenerate natives after plugin / ABI changes:

```bash
OTA_PLATFORM=android bun run prebuild:android
```

4. Build:

```bash
bun run android:release
# WSL: bun run build:android:release:wsl
```

Typical output: `android/app/build/outputs/apk/release/app-release.apk`

Use APKs for sideload/QA. Prefer **AAB** for Play Store.

### Release AAB (Google Play)

```bash
cd android
./gradlew bundleRelease
# Windows (no WSL): gradlew.bat bundleRelease
```

Typical output: `android/app/build/outputs/bundle/release/app-release.aab`

Upload in Play Console (internal testing → production).

### Android checklist

- [ ] `bun verify` green
- [ ] `expo.version` / `package.json` version bumped (store release only)
- [ ] Prebuild with Android OTA URL (`OTA_PLATFORM=android` or default)
- [ ] Release signing configured
- [ ] APK (sideload) **or** AAB (Play)
- [ ] Physical-device smoke test (CDN, tabs, donate, tel/mailto/maps)

---

## iOS — local (macOS only)

Windows cannot produce a store IPA locally. Use a Mac + Xcode, or **EAS** ([deployment-eas.md](./deployment-eas.md)).

### Debug (simulator / device)

```bash
OTA_PLATFORM=ios bun run prebuild:ios
bun run ios
bun run start   # Metro, if using dev-client
```

Requires Apple team signing in Xcode for physical devices.

### Store / TestFlight archive (Xcode)

1. Prebuild with iOS OTA URL:

```bash
OTA_PLATFORM=ios bun run prebuild:ios
```

2. Install pods if needed:

```bash
cd ios && pod install && cd ..
```

3. Open workspace:

```bash
open ios/*.xcworkspace
```

4. Select target **Sadhan Sangha Ashram** / `com.astrax.sadhansangha`.
5. **Signing & Capabilities** → Apple Team (development or distribution).
6. Scheme **Release** → Product → **Archive**.
7. Organizer → **Distribute App** → App Store Connect (or Ad Hoc / Enterprise as needed).

Store builds need a **distribution** provisioning profile (not only development).

### iOS checklist

- [ ] Mac + Xcode + Apple Developer Program membership
- [ ] `bun verify` green
- [ ] `expo.version` / `package.json` version bumped (store release only)
- [ ] Prebuild with `OTA_PLATFORM=ios`
- [ ] Bundle id `com.astrax.sadhansangha`
- [ ] Archive uploaded to App Store Connect
- [ ] TestFlight smoke test (CDN, tabs, donate, tel/mailto/maps)
- [ ] Privacy / usage strings updated if new restricted APIs are added

---

## Summary

| Goal | Android | iOS |
|------|---------|-----|
| Daily development | `bun run android` | `bun run ios` (macOS) |
| QA sideload | Release APK | Ad Hoc / TestFlight |
| Store upload | **AAB** → Play Console | Archive → App Store Connect |
| No Mac | Local Android OK | Use **EAS** for IPA |
| JS-only update | OTA — [ota-self-host.md](./ota-self-host.md) | Same (export **both** platforms) |

---

## Credentials safety

- Never commit keystores, provisioning profiles, or `google-services` secrets.
- Prefer password managers / CI secrets for release keys.
- Document Play Console and Apple Developer account owners outside this repo.
