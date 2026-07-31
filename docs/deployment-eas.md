# EAS Build & Submit (Android + iOS)

Cloud **native** builds and store submission with [Expo Application Services](https://docs.expo.dev/eas/).

This repo is already set up for **EAS Build + EAS Submit only**.

**JS OTA stays on our own CDN** (`ssa-static` / GitHub Pages via `expo-updates`) — see [ota-self-host.md](./ota-self-host.md). Do **not** run `eas update`, do **not** add EAS Update channels, and do **not** point `updates.url` at Expo’s servers.

| Concern | Who owns it |
|---------|-------------|
| Native binaries (AAB / IPA / APK) | **EAS Build** (this doc) |
| Store upload | **EAS Submit** (this doc) |
| JS hotfixes after a binary ships | **Self-hosted OTA** ([ota-self-host.md](./ota-self-host.md)) |

Already in the repository: `eas.json`, `app.config.js` (OTA URL from `EAS_BUILD_PLATFORM` / `OTA_PLATFORM`), and the required SDK packages (`expo`, `expo-dev-client`, `expo-updates`, …).  
The person shipping the store build only needs Expo login + store credentials.

---

## Release engineer steps (after `git clone`)

```bash
cd ssa-app   # https://github.com/Ax108/ssa-app
bun install
bun verify
```

### 1. Expo account + link project (once per machine / org)

1. Create/join an Expo account: [https://expo.dev](https://expo.dev)
2. CLI (no global install required):

```bash
bunx eas-cli@latest login
bunx eas-cli@latest whoami
```

3. Link this repo to an EAS project (writes `extra.eas.projectId` into the app config — **commit that change** so teammates share the same project):

```bash
bunx eas-cli@latest init
```

Keep `slug` as in `app.json`: `astrax-sadhan-sangha-app`.

### 2. Store credentials (once)

**Android (Play AAB signing):**

```bash
bunx eas-cli@latest credentials -p android
```

Generate a new keystore on EAS or upload an existing one. Prefer EAS-managed so no `.jks` lives in the repo.

**iOS (Apple Developer):**

```bash
bunx eas-cli@latest credentials -p ios
```

Needs an Apple Developer Program team. EAS can manage certs/profiles (App Store Connect API key recommended).

Also need Play Console / App Store Connect access for **submit**.

### 3. Version before a store build

Bump **both** before production:

- `app.json` → `expo.version`
- `package.json` → `version` (keep equal by convention)

Optional: with `"appVersionSource": "remote"` in `eas.json`, EAS can own native build numbers — see [EAS versioning](https://docs.expo.dev/build-reference/app-versions/).

Content/CDN gist versioning stays separate — [content-and-cdn.md](./content-and-cdn.md).

### 4. Build

Profiles are defined in committed **`eas.json`**:

| Profile | Use |
|---------|-----|
| `development` | `expo-dev-client` APK / iOS simulator for QA |
| `preview` | Internal distribution APK |
| `production` | Play **AAB** + store iOS IPA |

```bash
# Android production → .aab (Play Store)
bunx eas-cli@latest build -p android --profile production

# iOS production → App Store / TestFlight IPA
bunx eas-cli@latest build -p ios --profile production

# Both
bunx eas-cli@latest build --platform all --profile production

# Dev client (internal)
bunx eas-cli@latest build -p android --profile development
bunx eas-cli@latest build -p ios --profile development
```

Or package scripts:

```bash
bun run eas:build:android
bun run eas:build:ios
bun run eas:build:all

# Dev-client / internal QA (eas.json "development" profile)
bun run eas:build:dev:android
bun run eas:build:dev:ios
```

Watch the [Expo dashboard](https://expo.dev). Download artifacts from the build page.

During the cloud build, `app.config.js` reads `EAS_BUILD_PLATFORM` so Android binaries get the Android OTA manifest URL and iOS binaries get the iOS URL — still on **ssa-static**, not EAS Update.

### 5. Submit to stores

After a successful **production** build:

```bash
bunx eas-cli@latest submit -p android --profile production --latest
bunx eas-cli@latest submit -p ios --profile production --latest
```

Or:

```bash
bun run eas:submit:android
bun run eas:submit:ios
```

Configure Play service-account JSON and/or App Store Connect API key when prompted (stored by EAS, not in git).

Then finish rollout in Play Console / App Store Connect (TestFlight → review → release).

### 6. After a new store binary ships

Publish a matching self-hosted OTA for that `expo.version` so CDN has a bundle for the new runtime:

```bash
bun run ota:export:all
# commit + push astrarudra/ssa-static (main → release for Pages)
```

Details: [ota-self-host.md](./ota-self-host.md).

---

## What is already configured (do not reinvent)

- **`eas.json`** — build + submit profiles (no EAS Update block)
- **`app.config.js`** — self-hosted `updates.url` + `runtimeVersion.policy: appVersion`
- **`expo-updates`**, **`expo-dev-client`**, **`expo-build-properties`** — already in dependencies
- Package manager scripts under `eas:*` in `package.json`

## What is intentionally not included

- EAS Update / `eas update` / update channels
- Checked-in keystores, `.p8`, Play JSON, or API keys
- GitHub Actions that auto-build on every push (add later if the team wants CI)

## Local vs EAS

| Situation | Prefer |
|-----------|--------|
| Daily Android debug | Local `bun run android` ([deployment-local.md](./deployment-local.md)) |
| Windows + need iOS binary | **EAS** iOS `production` / `development` |
| Play AAB without local signing | **EAS** Android `production` |
| JS-only fix after binary is out | **Self-hosted OTA**, not a new EAS build |

## Release checklist

- [ ] `bun verify` green on the commit you build
- [ ] `eas init` done; `projectId` committed if new
- [ ] Android / iOS credentials configured in EAS
- [ ] `expo.version` (+ `package.json` version) bumped for store release
- [ ] `eas build` production succeeded
- [ ] `eas submit` completed (or AAB/IPA uploaded manually)
- [ ] Smoke TestFlight / Play internal (tabs, CDN, donate, external links)
- [ ] Matching **ssa-static** OTA published for the new runtime

## Official references

- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [App credentials](https://docs.expo.dev/app-signing/app-credentials/)
- [Development builds](https://docs.expo.dev/develop/development-builds/introduction/)
- Self-hosted OTA (this project): [ota-self-host.md](./ota-self-host.md)
