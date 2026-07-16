# EAS release & deployment (Android + iOS)

Cloud builds and store submission with [Expo Application Services](https://docs.expo.dev/eas/). Use this when you want reproducible CI builds, or **iOS binaries without keeping a local Mac** for compiling (you still need an Apple Developer account).

This repo may not yet include a committed `eas.json`. Create one when you adopt EAS (steps below).

## Prerequisites

1. Expo account: [https://expo.dev](https://expo.dev)
2. CLI:

```bash
bunx eas-cli@latest login
bunx eas-cli@latest whoami
```

3. Link the project (from app root):

```bash
cd ssa-app   # https://github.com/Ax108/ssa-app
bunx eas-cli@latest init
```

This sets an Expo project id on the app config (follow prompts). Keep `slug` aligned with `app.json` (`astrax-sadhan-sangha-app`).

4. Apple Developer Program (iOS) and Google Play Console (Android) access for store submits.

## Create `eas.json`

Example starting point (adjust profiles to match your process):

```json
{
  "cli": {
    "version": ">= 16.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "ios": { "simulator": true }
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "app-bundle" },
      "ios": { "resourceClass": "m-medium" }
    }
  },
  "submit": {
    "production": {}
  }
}
```

Notes:

- **`development`** — `expo-dev-client` binaries for QA on devices.
- **`preview`** — internal distribution (APK / ad hoc style flows).
- **`production`** — Play wants **app-bundle** (AAB); iOS produces store IPA via EAS.

Commit `eas.json` once the team agrees on profiles.

## Credentials

### Android

```bash
bunx eas-cli@latest credentials -p android
```

Generate or upload a keystore. EAS can manage it remotely so laptops do not all hold the same `.jks`.

### iOS

```bash
bunx eas-cli@latest credentials -p ios
```

Use Expo-managed or local credentials. You need an Apple Team ID and the ability to create distribution certificates / provisioning profiles (EAS can automate with an App Store Connect API key).

## Build

### Android production (AAB)

```bash
bunx eas-cli@latest build -p android --profile production
```

### iOS production

```bash
bunx eas-cli@latest build -p ios --profile production
```

### Both

```bash
bunx eas-cli@latest build --platform all --profile production
```

### Dev client (internal)

```bash
bunx eas-cli@latest build -p android --profile development
bunx eas-cli@latest build -p ios --profile development
```

Watch progress on the Expo dashboard. Download artifacts from the build page or install via the QR / internal distribution link.

## Submit to stores

After a successful **production** build:

```bash
# Android → Google Play (track chosen interactively or via eas.json)
bunx eas-cli@latest submit -p android --profile production --latest

# iOS → App Store Connect
bunx eas-cli@latest submit -p ios --profile production --latest
```

You will need Play service account JSON and/or App Store Connect API key configured once (EAS prompts or `eas.json` / credentials store).

Then finish release rollout in:

- **Google Play Console** — testing tracks → production
- **App Store Connect** — TestFlight → App Review → release

## Versioning

- Bump `expo.version` in `app.json` for user-facing version.
- With `"appVersionSource": "remote"`, EAS can manage build numbers remotely — follow current Expo docs for `eas build:version:set`.
- Keep website/CDN content versioning independent (gist) — see [content-and-cdn.md](./content-and-cdn.md).

## Local vs EAS — when to use which

| Situation | Prefer |
|-----------|--------|
| Fast Android debug iteration | Local `bun run android` |
| Windows machine, need iOS binary | **EAS** iOS build |
| Play Store AAB without local signing pain | **EAS** Android `production` |
| Offline / air-gapped signing policy | Local Gradle / Xcode ([deployment-local.md](./deployment-local.md)) |
| CI on every main merge | EAS + GitHub Action calling `eas build` |

## Release checklist (EAS)

- [ ] `bun verify` green on the commit you build
- [ ] `eas.json` profiles reviewed
- [ ] Credentials valid for Android and/or iOS
- [ ] `expo.version` (and build numbers) bumped
- [ ] Production build succeeded on Expo dashboard
- [ ] Submit completed; store listing / screenshots / privacy updated
- [ ] TestFlight / Play internal track smoke test (tabs, CDN, external links)

## Official references

- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [App credentials](https://docs.expo.dev/app-signing/app-credentials/)
- [Development builds](https://docs.expo.dev/develop/development-builds/introduction/)
