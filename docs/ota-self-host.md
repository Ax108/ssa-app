# Self-hosted JS OTA ([astrarudra/ssa-static](https://github.com/astrarudra/ssa-static))

App origin: [Ax108/ssa-app](https://github.com/Ax108/ssa-app)  
CDN / OTA host origin: [astrarudra/ssa-static](https://github.com/astrarudra/ssa-static)

The app uses **`expo-updates`** with **full** JS bundles on GitHub Pages:

`https://astrarudra.github.io/ssa-static/prod/mobile-app-ota/`

Layout and host-side notes: [prod/mobile-app-ota/README.md](https://github.com/astrarudra/ssa-static/blob/main/prod/mobile-app-ota/README.md)
(Pages deploy branch: **`release`**).

This is **JS-bundle OTA only** (no font/media OTA lanes). No EAS Update, no
WAF client keys, no Vercel, **no BSDIFF** — GitHub Pages is static and cannot
negotiate patch responses (HTTP 226), so every update is a full Hermes download.

## Versioning (`app.json` vs store vs OTA)

| Concept | Role |
|---------|------|
| **`app.json` → `expo.version`** ([ssa-app](https://github.com/Ax108/ssa-app)) | OTA `runtimeVersion` (`policy: "appVersion"`). Manifest must match the binary. |
| **`package.json` → `version`** | Keep equal by convention; Expo Updates does not read it. |
| **CDN `storeApp.latestVersion`** | Newest **store** binary. Set **manually** in [prod/json/config.json](https://github.com/astrarudra/ssa-static/blob/main/prod/json/config.json). When newer than the installed app, show the store prompt and **skip JS OTA**. |
| **Platform folders** | Flat `android/` and `ios/` only — **no** `android/<version>/` trees. |

Rules:

- **JS-only OTA** — do **not** bump `expo.version`. Export into the same flat platform folders in [ssa-static](https://github.com/astrarudra/ssa-static).
- **Store / native release** — in [ssa-app](https://github.com/Ax108/ssa-app), bump `expo.version` + `package.json` version, ship store binaries; then in [ssa-static](https://github.com/astrarudra/ssa-static) set `prod/json/config.json` → `storeApp.latestVersion` to that same string (and keep the app seed `src/assets/json/config.json` in sync). Afterward publish matching JS OTA for the new runtime. Older binaries are prompted to Play / App Store.

### Manual store version bump (required for the in-app store prompt)

There is **no** Play / App Store API. After a new binary is live on the stores:

1. Edit [astrarudra/ssa-static](https://github.com/astrarudra/ssa-static) → `prod/json/config.json` → `storeApp.latestVersion` to match `app.json` `expo.version`.
2. Commit, push, and get that change onto the Pages **`release`** branch.
3. Optionally update locale `storeUpdateMessage` / `storeUpdateAction` under `prod/json/{en,hi,bn}.json`.

## App config

`app.config.js` sets:

| Field | Value |
|-------|--------|
| `runtimeVersion.policy` | `appVersion` |
| `updates.url` | `…/mobile-app-ota/{android\|ios}/manifest.json` |
| `updates.checkAutomatically` | `NEVER` (React owns check/fetch) |
| `updates.fallbackToCacheTimeout` | `0` |
| plugin | `expo-updates` |

Platform for the baked URL: `OTA_PLATFORM` → `EAS_BUILD_PLATFORM` → CLI `--platform` → default `android`. Always prebuild with `prebuild:android` / `prebuild:ios` before store binaries.

Changing `checkAutomatically` / update URL requires a **new native build** (re-prebuild).

## Runtime behaviour

### Store gate

`shouldDeferToStoreUpdate()` — when CDN `storeApp.latestVersion` is newer than
the installed binary and a store URL exists, `StoreUpdateSnackbar` prompts the
user (CTA opens Play / App Store). JS OTA does not run in that case.

Set `iosAppId` (or `iosStoreUrl`) in `storeApp` before iOS deep-links work.

### JS OTA

`createJsBundleOtaController` + `useJsBundleOtaSync` (from `AppRoot`):

1. Skipped in `__DEV__` / when `Updates.isEnabled` is false / when store update is required
2. On startup: `checkForUpdateAsync` → `fetchUpdateAsync` in the background (splash never waits)
3. On true **background → active** opening: `reloadAsync` if a download finished; otherwise check/fetch again
4. Inactive (notification shade / permission dialog) does **not** count as an opening
5. Cold start launches the newest valid cached update through Expo natively

### Publisher

`scripts/publish-ota.mjs` in [ssa-app](https://github.com/Ax108/ssa-app) exports a content-hashed full Hermes bundle + assets into `{platform}/` under a local clone of [ssa-static](https://github.com/astrarudra/ssa-static), replaces that folder, and points `launchAsset.url` at the `.hbc` on Pages. Optional response headers (if Cloudflare fronts Pages): [GITHUB_PAGES_HEADERS.md](https://github.com/astrarudra/ssa-static/blob/main/prod/mobile-app-ota/docs/GITHUB_PAGES_HEADERS.md).

OTA staging is **local filesystem only** (default `--out` `../ssa-static/prod/mobile-app-ota`). Clone [ssa-static](https://github.com/astrarudra/ssa-static) as a **sibling directory** of your [ssa-app](https://github.com/Ax108/ssa-app) clone (same parent folder), or pass `--out` to another path. See the host README for the required layout.

## Publish scripts

| Script | Platforms |
|--------|-----------|
| `bun run ota:export:android` | Android |
| `bun run ota:export:ios` | iOS |
| `bun run ota:export:all` | both |
| `bun run ota:test` | publisher unit tests |

```bash
# From a local clone of https://github.com/Ax108/ssa-app
# with https://github.com/astrarudra/ssa-static cloned as a sibling named ssa-static
bun run ota:test
bun run ota:export:all
cd ../ssa-static
git add prod/mobile-app-ota
git commit -m "## Publish mobile OTA bundles"
git push
# merge main → release so GitHub Pages deploys
```

## When OTA is enough vs store build

### JS-only (OTA)

UI / logic / JS assets with no native changes — keep `expo.version`, export, push
[ssa-static](https://github.com/astrarudra/ssa-static).

### Native / store

New native modules, SDK, prebuild, or update URL / `checkAutomatically` changes:

1. Bump versions in [ssa-app](https://github.com/Ax108/ssa-app), rebuild + submit store binaries
2. Manually set CDN `storeApp.latestVersion` in [ssa-static](https://github.com/astrarudra/ssa-static) `prod/json/config.json`
3. Still run `ota:export:all` for the new runtime into flat platform folders

## Tests

- `src/tests/updatesController.test.ts` — controller / sync / store gate
- `src/tests/storeUpdateController.test.ts` — snackbar prompt + `shouldDeferToStoreUpdate`
- `bun run ota:test` — content-hashed launch URL helpers
