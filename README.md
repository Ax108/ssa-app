# Sadhan Sangha Ashram (mobile)

Expo React Native app for [Sadhan Sangha Ashram](https://sadhansangha.in). Content and brand follow the live website CDN; navigation and chrome are native (React Navigation nested stack + custom tab bar, Zustand). Splash awaits fonts, content init (AsyncStorage / CDN), and self-hosted JS OTA sync before the main UI. See [docs/ota-self-host.md](./docs/ota-self-host.md).

| | |
|---|---|
| **Package / bundle id** | `sadhan.sangha` (Android + iOS) |
| **Stack** | Expo ~57 · React Native 0.86 · React 19 · Bun · TypeScript |
| **Package manager** | [Bun](https://bun.sh) (`node` ≥ 24) |

## Quick start

```bash
cd ssa-app   # clone of https://github.com/Ax108/ssa-app
bun install
bun run prebuild          # generate android/ (and ios/ on macOS)
bun run prebuild:android  # Android-only clean prebuild
bun run android           # or: bun run ios  (macOS + Xcode)
bun run start             # Metro with expo-dev-client
```

Full setup (tooling, emulators, WSL notes): **[docs/getting-started.md](./docs/getting-started.md)**.

### Local Google Play AAB (no EAS)

1. Copy `.env.example` → `.env` and set `ANDROID_UPLOAD_*` (keystore under `credentials/`, gitignored).
2. `bun run prebuild:android` — sets OTA to android and injects release signing.
3. `cd android && ./gradlew bundleRelease`
4. Upload `android/app/build/outputs/bundle/release/app-release.aab` in Play Console.

Local iOS (Mac): `bun run prebuild:ios` then Xcode Archive — see **[docs/deployment-local.md](./docs/deployment-local.md)**. Back up `.env` and `credentials/` offline.

## Documentation

| Doc | Topic |
|-----|--------|
| [docs/README.md](./docs/README.md) | Index of all docs |
| [docs/getting-started.md](./docs/getting-started.md) | Install, env, first run |
| [docs/folder-structure.md](./docs/folder-structure.md) | Repo and `src/` layout |
| [docs/architecture.md](./docs/architecture.md) | How the code fits together |
| [docs/content-and-cdn.md](./docs/content-and-cdn.md) | Remote config / texts / assets |
| [docs/ota-self-host.md](./docs/ota-self-host.md) | Self-hosted JS OTA via `ssa-static` |
| [docs/development-workflow.md](./docs/development-workflow.md) | Day-to-day scripts and habits |
| [docs/testing.md](./docs/testing.md) | Jest, `bun verify`, GitHub Actions CI |
| [docs/deployment-local.md](./docs/deployment-local.md) | Local Play AAB (`.env` signing) + iOS Xcode archive |
| [docs/deployment-eas.md](./docs/deployment-eas.md) | Optional EAS Build / Submit (cloud) |

## Useful scripts

```bash
bun run start             # Metro (dev client)
bun run android           # Debug build + install (device/emulator)
bun run ios               # iOS (macOS)
bun run android:release   # Local Android release APK (sideload / QA — not Play AAB)
bun run prebuild          # Regenerate native projects (injects Android signing from .env)
bun run prebuild:android  # Android-only clean prebuild
bun run ota:export:android  # Stage Android OTA into astrarudra/ssa-static
bun run ota:export:ios      # Stage iOS OTA
bun run ota:export:all      # Both platforms
bun run eas:build:android   # Optional: EAS production AAB (requires eas login)
bun run eas:build:ios       # Optional: EAS production IPA
bun run eas:build:dev:android  # Optional: EAS development APK (dev-client)
bun run eas:build:dev:ios      # Optional: EAS development iOS (simulator profile)
bun run eas:submit:android  # Optional: Submit latest EAS Android build to Play
bun run eas:submit:ios      # Optional: Submit latest EAS iOS build to App Store Connect
bun run verify            # lint + tsc + tsc:app + jest
bun run test              # Jest only
bun run doctor            # expo-doctor
```

Local Play store file: after prebuild with `.env` set, run `cd android && ./gradlew bundleRelease` (see [docs/deployment-local.md](./docs/deployment-local.md)).  
JS OTA is self-hosted ([docs/ota-self-host.md](./docs/ota-self-host.md)). EAS scripts are optional for cloud natives ([docs/deployment-eas.md](./docs/deployment-eas.md)) — not EAS Update.

## Related projects

| Role | Repo |
|------|------|
| Live website | [astrarudra/sadhan-sangha](https://github.com/astrarudra/sadhan-sangha) |
| Static CDN / OTA host | [astrarudra/ssa-static](https://github.com/astrarudra/ssa-static) |
| This mobile app | [Ax108/ssa-app](https://github.com/Ax108/ssa-app) |

CDN base used at runtime: `https://astrarudra.github.io/ssa-static/prod/` — see [docs/content-and-cdn.md](./docs/content-and-cdn.md).  
JS OTA base: `https://astrarudra.github.io/ssa-static/prod/mobile-app-ota/` — see [docs/ota-self-host.md](./docs/ota-self-host.md).

## License

Proprietary. Owned by AstraX. All rights reserved.
