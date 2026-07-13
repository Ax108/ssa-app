# Sadhan Sangha Ashram (mobile)

Expo React Native app for [Sadhan Sangha Ashram](https://sadhansangha.in). Content and brand follow the live website CDN; navigation and chrome are native (React Navigation nested stack + custom tab bar, Zustand). Splash awaits fonts and content init (AsyncStorage cache and/or CDN version sync) before the main UI.

| | |
|---|---|
| **Package** | `com.astrax.sadhansangha` |
| **Stack** | Expo ~57 · React Native 0.86 · React 19 · Bun · TypeScript |
| **Package manager** | [Bun](https://bun.sh) (`node` ≥ 24) |

## Quick start

```bash
cd Astrax-sadhan-sangha-app
bun install
bun run prebuild          # generate android/ (and ios/ on macOS)
bun run prebuild:android  # Android-only clean prebuild
bun run android           # or: bun run ios  (macOS + Xcode)
bun run start             # Metro with expo-dev-client
```

Full setup (tooling, emulators, WSL notes): **[docs/getting-started.md](./docs/getting-started.md)**.

## Documentation

| Doc | Topic |
|-----|--------|
| [docs/README.md](./docs/README.md) | Index of all docs |
| [docs/getting-started.md](./docs/getting-started.md) | Install, env, first run |
| [docs/folder-structure.md](./docs/folder-structure.md) | Repo and `src/` layout |
| [docs/architecture.md](./docs/architecture.md) | How the code fits together |
| [docs/content-and-cdn.md](./docs/content-and-cdn.md) | Remote config / texts / assets |
| [docs/development-workflow.md](./docs/development-workflow.md) | Day-to-day scripts and habits |
| [docs/testing.md](./docs/testing.md) | Jest and `bun verify` |
| [docs/deployment-local.md](./docs/deployment-local.md) | Local Android / iOS release builds |
| [docs/deployment-eas.md](./docs/deployment-eas.md) | EAS Build / Submit (cloud) |

## Useful scripts

```bash
bun run start             # Metro (dev client)
bun run android           # Debug build + install (device/emulator)
bun run ios               # iOS (macOS)
bun run android:release   # Local Android release variant
bun run prebuild          # Regenerate native projects
bun run prebuild:android  # Android-only clean prebuild
bun run verify            # lint + tsc + tsc:app + jest
bun run test              # Jest only
bun run doctor            # expo-doctor
```

## Related projects (workspace)

| Role | Path |
|------|------|
| Live website (content source of truth) | `[../sadhan-sangha/](https://github.com/astrarudra/sadhan-sangha)` |
| Mobile UX visual sample (patterns only) | `../UX-ForMobile-sample-app/` |

CDN base used at runtime: `https://astrarudra.github.io/ssa-static/prod/` — see [docs/content-and-cdn.md](./docs/content-and-cdn.md).

## License

Proprietary. Owned by AstraX. All rights reserved.
