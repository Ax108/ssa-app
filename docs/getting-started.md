# Getting started

How developers install tooling and run the app in development.

## Prerequisites

| Tool | Requirement | Notes |
|------|-------------|--------|
| **Bun** | ≥ 1.0 | Primary package manager and script runner |
| **Node** | ≥ 24 | Declared in `package.json` `engines` |
| **Git** | any recent | Clone this repo |
| **Android Studio** | latest stable | SDK, emulator, or USB device (Android work) |
| **JDK** | 17 (typical for RN/Gradle) | Used by Android Gradle |
| **Xcode** | latest stable | **macOS only** — required for iOS simulator / device |
| **CocoaPods** | current | iOS native deps after prebuild (`pod install`) |

Optional:

- **WSL2** on Windows — used by scripts like `wsl:prebuild-android` / `build:android:wsl` if you prefer Linux Gradle.
- **Expo account** — only needed for optional [EAS Build / Submit](./deployment-eas.md). **Not** required for local debug or a local Play **AAB** (`.env` upload key + `./gradlew bundleRelease` — [deployment-local.md](./deployment-local.md)). JS OTA does **not** use EAS Update.

This app uses a **development build** (`expo-dev-client`), not Expo Go. You must produce a native binary once, then use Metro against that client.

## Clone and install

From the clone root ([Ax108/ssa-app](https://github.com/Ax108/ssa-app)):

```bash
cd ssa-app
bun install
```

`prepare` runs Husky. If hooks fail in a restricted environment, fix permissions or re-run `bun install` after cloning.

## Generate native projects

`android/` and `ios/` are **generated** (and typically gitignored). Create them with Expo prebuild:

```bash
# Both platforms (ios/ only fully useful on macOS)
bun run prebuild

# Android only (common on Windows)
bun run prebuild:android

# iOS only (macOS)
bun run prebuild:ios
```

On Windows + WSL for Android:

```bash
bun run wsl:prebuild-android
```

After changing native plugins, permissions, or packages that touch native code, run prebuild again (`--clean` when native config drifts).

## First run — Android

1. Start an emulator **or** enable USB debugging on a device.
2. Build and install the debug app:

```bash
bun run android
```

This runs `expo run:android` (compiles native + installs).

3. In another terminal (or after the build finishes), start Metro:

```bash
bun run start
# or clear cache:
bun run devClear
```

Open the installed **Sadhan Sangha Ashram** / `com.astrax.sadhansangha` app; it should connect to Metro.

## First run — iOS (macOS)

```bash
bun run prebuild:ios
bun run ios
bun run start
```

Use a simulator from Xcode or a signed development device. Physical devices need an Apple Developer team configured in Xcode after prebuild.

## What “ready” looks like

1. Custom splash stays until **fonts**, **awaited `contentController.init()`** (cache and/or CDN + version sync), **awaited OTA sync**, and a short ~500ms floor after fonts.
2. Custom bottom bar over a **single nested stack**: Home, Ashram, Satsang, Gallery, Contact (see [architecture.md](./architecture.md)).
3. Images load from the production CDN (or seed JSON offline); YouTube/Spotify open externally.

If the binary is missing Expo modules (e.g. after adding `expo-linear-gradient`), rebuild the native app (`bun run android` / `ios`) — Metro alone is not enough.

## Environment checklist

- [ ] `bun install` completed without errors
- [ ] `android/` exists after prebuild (and `ios/` on Mac if needed)
- [ ] Emulator/device visible (`adb devices` for Android)
- [ ] `bun run android` or `bun run ios` succeeded once
- [ ] `bun run start` shows Metro; app loads JS bundle
- [ ] `bun verify` passes before you push (see [testing.md](./testing.md))

## Next reading

- [folder-structure.md](./folder-structure.md)
- [development-workflow.md](./development-workflow.md)
- [architecture.md](./architecture.md)
- [deployment-local.md](./deployment-local.md) — local Play AAB (`.env` signing) and iOS archive
- [testing.md](./testing.md) — `bun verify` and GitHub Actions CI
