# EAS Build & Submit (Android + iOS)

Cloud **native** builds and store submission via [Expo Application Services](https://docs.expo.dev/eas/).

**Optional path.** For the current **local** Play AAB flow (`.env` upload key + `./gradlew bundleRelease`, no EAS), use [deployment-local.md](./deployment-local.md) instead.

**Scope of this doc:** EAS Build + EAS Submit only.

**Out of scope:** EAS Update. JS OTA is self-hosted on GitHub Pages (`ssa-static`). See [ota-self-host.md](./ota-self-host.md).

| Concern | System |
|---------|--------|
| Android `.aab` / iOS `.ipa` | EAS Build (this doc) |
| Upload to Play / App Store Connect | EAS Submit (this doc) |
| JS hotfixes after a binary ships | Self-hosted OTA ([ota-self-host.md](./ota-self-host.md)) |

**Already in the repo:** `eas.json`, `app.config.js`, `eas:*` scripts, `expo` / `expo-dev-client` / `expo-updates`.

**Release engineer still provides:** Expo login, Play + Apple credentials (not stored in git).

---

## Artifacts by platform

| Platform | Profile | Output | Store |
|----------|---------|--------|--------|
| Android | `production` | **`.aab`** (`buildType: app-bundle`) | Google Play |
| iOS | `production` | **`.ipa`** (store / TestFlight) | App Store Connect |
| Android | `development` / `preview` | **`.apk`** | Sideload / internal QA |
| iOS | `development` | Simulator build (`simulator: true`) | Local QA only |

Production commands bake the correct OTA URL automatically: EAS sets `EAS_BUILD_PLATFORM` to `android` or `ios` during the cloud build (`app.config.js`).

---

## Prerequisites (once)

```bash
cd ssa-app   # https://github.com/Ax108/ssa-app
bun install
bun verify
```

### Expo project

```bash
bunx eas-cli@latest login
bunx eas-cli@latest whoami
bunx eas-cli@latest init
```

- Keep `slug`: `astrax-sadhan-sangha-app` (`app.json`).
- Commit `extra.eas.projectId` after `init` so the team shares one project.

### Credentials

| Platform | Command | Requires |
|----------|---------|----------|
| Android | `bunx eas-cli@latest credentials -p android` | Play Console access; EAS-managed or uploaded keystore (no `.jks` in git) |
| iOS | `bunx eas-cli@latest credentials -p ios` | Apple Developer Program; distribution certs / profiles (App Store Connect API key recommended) |

---

## Versioning before a store release

Bump **both** (same string):

- `app.json` → `expo.version` (user-facing + OTA `runtimeVersion`)
- `package.json` → `version`

With `"appVersionSource": "remote"` in `eas.json`, EAS owns **`android.versionCode`** and **`ios.buildNumber`**. Do not manage those integers in `app.json` unless you switch to `"local"`.

Content/CDN gist versioning is separate — [content-and-cdn.md](./content-and-cdn.md).

---

## Build

Profiles live in committed `eas.json`.

### Production (store)

```bash
# Android → .aab
bun run eas:build:android
# equivalent: bunx eas-cli@latest build -p android --profile production

# iOS → .ipa (App Store / TestFlight)
bun run eas:build:ios
# equivalent: bunx eas-cli@latest build -p ios --profile production

# Both platforms
bun run eas:build:all
```

### Development / internal QA

```bash
bun run eas:build:dev:android   # APK + expo-dev-client
bun run eas:build:dev:ios       # iOS simulator profile
```

Monitor builds on [expo.dev](https://expo.dev). Download artifacts from the build page.

---

## Submit to stores

After a successful **production** build:

```bash
# Google Play
bun run eas:submit:android
# equivalent: bunx eas-cli@latest submit -p android --profile production --latest

# App Store Connect (TestFlight → App Review → release)
bun run eas:submit:ios
# equivalent: bunx eas-cli@latest submit -p ios --profile production --latest
```

When prompted, configure Play service-account JSON and/or App Store Connect API key (stored by EAS, not in git).

Then complete rollout in:

- **Android:** Google Play Console (testing track → production)
- **iOS:** App Store Connect (TestFlight → review → release)

---

## After a new store binary ships

Publish OTA for the **same** `expo.version` (both platforms):

```bash
bun run ota:export:all
# commit + push astrarudra/ssa-static (main → release for GitHub Pages)
```

See [ota-self-host.md](./ota-self-host.md).

---

## Do / Do not

| Do | Do not |
|----|--------|
| Use EAS for Android AAB and iOS IPA | Run `eas update` or add EAS Update channels |
| Keep OTA on `ssa-static` Pages | Point `updates.url` at Expo’s update servers |
| Bump `expo.version` + `package.json` version for store releases | Commit keystores, `.p8`, or Play JSON |
| Export OTA for **android and ios** after a version bump | Assume one platform’s OTA covers the other |

---

## Local vs EAS

| Situation | Prefer |
|-----------|--------|
| Daily Android debug | Local `bun run android` — [deployment-local.md](./deployment-local.md) |
| Daily iOS debug | Local `bun run ios` on macOS — [deployment-local.md](./deployment-local.md) |
| Windows + need iOS IPA | **EAS** `eas:build:ios` |
| Play AAB without EAS | **Local** `.env` signing + `bundleRelease` — [deployment-local.md](./deployment-local.md) |
| Play AAB without managing a local keystore | **EAS** `eas:build:android` (optional) |
| JS-only fix (same `expo.version`) | Self-hosted OTA only — no new EAS build |

---

## Release checklist

### Shared

- [ ] `bun verify` green on the commit you build
- [ ] `eas init` done; `projectId` committed if new
- [ ] `expo.version` and `package.json` `version` bumped (same string)
- [ ] Matching **ssa-static** OTA published for the new runtime (`ota:export:all`)

### Android

- [ ] Android credentials configured in EAS
- [ ] `eas:build:android` succeeded → **`.aab`** available
- [ ] `eas:submit:android` completed (or AAB uploaded in Play Console)
- [ ] Play internal / production smoke test (tabs, CDN, donate, tel/mailto/maps)

### iOS

- [ ] iOS credentials configured in EAS (Apple team)
- [ ] `eas:build:ios` succeeded → **`.ipa`** available
- [ ] `eas:submit:ios` completed (or IPA uploaded in App Store Connect)
- [ ] TestFlight smoke test (tabs, CDN, donate, tel/mailto/maps)
- [ ] App Review / release completed when ready

---

## Official references

- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [App credentials](https://docs.expo.dev/app-signing/app-credentials/)
- [App versions](https://docs.expo.dev/build-reference/app-versions/)
- [Development builds](https://docs.expo.dev/develop/development-builds/introduction/)
- Self-hosted OTA: [ota-self-host.md](./ota-self-host.md)
