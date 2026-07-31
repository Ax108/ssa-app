# Development workflow

Day-to-day habits and scripts for this repo.

## Package manager

Use **Bun** for install and scripts:

```bash
bun install
bun run <script>
```

Do not mix `npm install` / `yarn` into the same tree unless you intentionally migrate lockfiles.

## Common scripts

| Script | What it does |
|--------|----------------|
| `start` / `dev` | Metro with `--dev-client` |
| `devClear` | Metro with cache clear (`-c`) |
| `android` | `expo run:android` (debug) |
| `ios` | `expo run:ios` (macOS) |
| `prebuild` | `expo prebuild --clean` (both platforms) |
| `prebuild:android` | Android-only prebuild (`--clean`) |
| `prebuild:ios` | iOS-only prebuild |
| `wsl:prebuild-android` | Same Android prebuild (WSL-oriented alias) |
| `build:android:wsl` | Gradle `assembleDebug` inside `android/` |
| `android:release` | `expo run:android --variant release` |
| `build:android:release:wsl` | Gradle `assembleRelease` |
| `lint` / `lint:app` | ESLint (app ignores tests for `:app`) |
| `tsc` / `tsc:app` | Typecheck (full / without tests project) |
| `format` | Prettier write |
| `test` / `test:watch` | Jest |
| `verify` | lint + tsc + tsc:app + test |
| `doctor` | `expo-doctor` |
| `ota:export:android` | Export JS OTA → [ssa-static](https://github.com/astrarudra/ssa-static) `prod/mobile-app-ota/android/` |
| `ota:export:ios` | Export JS OTA → `prod/mobile-app-ota/ios/` |
| `ota:export:all` | Export both platforms (android then ios) |
| `eas:build:android` / `:ios` / `:all` | Optional EAS production Build (AAB / IPA) — login required |
| `eas:build:dev:android` / `:ios` | Optional EAS **development** profile (dev-client APK / iOS simulator) |
| `eas:submit:android` / `:ios` | Optional EAS Submit to Play / App Store Connect |

Local Play **AAB** (preferred when not using EAS): configure `.env` → `bun run prebuild:android` → `cd android && ./gradlew bundleRelease` — **[deployment-local.md](./deployment-local.md)**.  
OTA details (versioning, when to bump `app.json`, Metro vs binary): **[ota-self-host.md](./ota-self-host.md)**.  
Optional EAS Build/Submit (not EAS Update): **[deployment-eas.md](./deployment-eas.md)**.

## When to rebuild native vs reload JS

| Change | Action |
|--------|--------|
| TS/TSX, styles, most JS logic | Fast Refresh / reload Metro; ship to devices via `ota:export:*` + push `ssa-static` |
| New Expo native module / plugin | `prebuild` (if needed) + `bun run android` / `ios`; bump versions; still publish OTA |
| `app.json` icons, permissions, package id | prebuild + native rebuild |
| `plugins/*.js` | prebuild + native rebuild |
| Only CDN JSON on the server | Kill/reopen app or clear AsyncStorage to force refetch |

## Prebuild discipline

- Do **not** commit one-off hacks into `android/` / `ios/` for product features.
- Prefer Expo config (`app.json`) and config plugins under `plugins/`.
- After `--clean` prebuild, re-open the project in Android Studio / Xcode if you use IDE signing UI.

## Branch hygiene before push

```bash
bun verify
```

Fix lint, types, and failing tests locally. Husky may also run hooks on commit.

## Hot tips

- **AsyncStorage:** this project pins `@react-native-async-storage/async-storage` **v2** for Expo compatibility. Do not jump to v3 without verifying the native module links in the Expo 57 binary.
- **Content boot:** splash awaits cache + version sync **and** OTA sync; clearing AsyncStorage forces a full CDN load on next start.
- **Logging:** use `logger` from `@shared/utils/logger` (dev-only); avoid raw `console.*` in app code.
- **External links:** `openExternalUrl` in `@shared/utils/openUrl`.
- **Native changes:** never hand-edit `android/` or `ios/`. Use `app.json` plugins (`expo-build-properties`, `plugins/android/*`) then `bun run prebuild`.
- **Release ABIs:** `expo-build-properties` sets `arm64-v8a` + `x86_64` only to avoid Windows Reanimated CMake/`armeabi-v7a` ninja failures; Gradle heap is raised via `plugins/android/withGradleJvmArgs.js`.
- **Local Play AAB signing:** `plugins/android/withAndroidReleaseSigning.js` reads `.env` (`ANDROID_UPLOAD_*`) on every Android prebuild — see [deployment-local.md](./deployment-local.md).
- **Linear gradient:** if the installed binary lacks the native module, `AppLinearGradient` falls back; still rebuild after adding the dependency for production quality.
- **Text nesting:** Pressable children must be valid RN trees (wrap text in `Text` / structure views carefully — see Satsang screen patterns).
- **Tab bar height / safe area:** padding belongs on the custom tab bar, not a large bottom inset on `AppRoot`.

## Related docs

- [getting-started.md](./getting-started.md)
- [testing.md](./testing.md)
- [deployment-local.md](./deployment-local.md)
