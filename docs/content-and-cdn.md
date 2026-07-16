# Content and CDN

How remote configuration, strings, and media reach the app.

## Sources of truth

| Source | Role |
|--------|------|
| Website ([astrarudra/sadhan-sangha](https://github.com/astrarudra/sadhan-sangha)) | Editorial content that ships to production CDN |
| CDN ([astrarudra/ssa-static](https://github.com/astrarudra/ssa-static)) | `https://astrarudra.github.io/ssa-static/prod/` |
| Gist | Version bump used to invalidate cache |
| Bundled seed | `src/assets/json/config.json`, `en.json`, `bn.json`, `hi.json` |

Canonical site URL (privacy, etc.): `https://sadhansangha.in` (`siteUrl` in `src/constants/cdn.ts`).

## Constants

Defined in `src/constants/cdn.ts`:

| Constant | Purpose |
|----------|---------|
| `gitBase` / `gitAssetBase` | Prod static host + `assets/` prefix |
| `GIST.version` | Gist id for version file |
| `GIT.config` / `GIT.texts.{en,bn,hi}` | Paths to config + locale text packs |
| `LOCALSTORE.config` / `locale` / `en`/`bn`/`hi` | AsyncStorage keys |
| `LOCALES` / `DEFAULT_LOCALE` | `en` \| `bn` \| `hi` |

Asset URLs and markdown helpers live in `src/shared/utils/assetUrl.ts`; config path stamping in `formatConfig.ts`.

## Network

`src/shared/serviceCalls/oxyApi.ts` uses the platform **`fetch` API only** (no axios).

| Method | Use |
|--------|-----|
| `getGist(id, useCache?)` | Version file; `useCache: true` omits cache-buster (sync check) |
| `getGit(path)` | `config.json` / `en\|bn\|hi.json` from CDN |

## Boot sequence

Driven from `src/App.tsx` (splash gate) and implemented in `src/appStore/contentController.ts`:

1. **Fonts** load in parallel via `useLoadFonts`.
2. **`await contentController.init()`** (splash stays until this finishes):
   - Resolve saved locale (default `en`).
   - Read AsyncStorage for `config` + locale texts.
   - **Empty cache** → `loadVersion(locale)`: gist version → fetch CDN JSON → persist → apply to Zustand.
   - **Cache hit** → apply cache immediately → **`await syncVersion()`** (gist; if version changed → `await loadVersion()`).
   - **Failure** → use remaining cache if any, else bundled seed JSON for that locale; still mark content ready so the UI can open offline.
3. Splash also waits a short **~500ms after fonts** (`splashMinElapsed`) for brand presence.
4. Splash also **awaits** `syncOtaUpdate()` (OTA check/fetch) before mounting `AppRoot`.
5. Then `AppRoot` / navigation mounts. Screens only **read** the store — they do not refetch on tab change.
6. **Language switcher** (top navbar) calls `contentController.setLocale` — uses cached locale pack or fetches `GIT.texts[locale]`.

Images (CDN assets, YouTube thumbnails) still load over the network through `expo-image` as views appear.

## Rendering CDN copy

CDN long-form fields often use `**Heading**` plus multi-space runs (and sometimes literal `\n`). Helpers in `assetUrl.ts`:

| Helper | Use |
|--------|-----|
| `stripBasicMarkdown` | Teasers / short strips |
| `paragraphsFromMarkdown` | Blank-line splits after strip (Ashram / Donation note) |
| `sectionsFromMarkdown` | Bold-heading sections (Satsang body) |

## What screens should do

- Read **strings and structured sections** from `texts` / `config` in the store.
- Resolve image paths with the asset URL helpers (relative CDN paths → absolute HTTPS).
- Open external destinations with `openExternalUrl` (podcast, Amazon, maps, mailto, tel, YouTube).
- Avoid duplicating long marketing copy that already exists on the website CDN.
- Do **not** embed YouTube/Spotify WebViews for primary content — thumbnails / cards that open externally.
- Donation is an **in-app stack screen** (not a 6th bottom tab) — bank fields from `config.donationDetails`. Discoverability: Home section between Follow Us and Find Us, plus footer link.

## Store binary update snackbar

Separate from CDN content `version` and from JS OTA.

| Piece | Role |
|-------|------|
| `config.storeApp.latestVersion` | Newest **store** semver (e.g. `1.0.1`) |
| Installed `expo.version` | Compared via `isRemoteAppVersionNewer` |
| `StoreUpdateSnackbar` | Global bar above nav, only after custom splash (`AppRoot`) |
| Session dismiss | Hide until **next cold start**; if still outdated, show again |

Bump `storeApp.latestVersion` on the CDN (and seed) when a new binary is on Play / App Store. Set `iosAppId` (or `iosStoreUrl`) before iOS can deep-link; Android uses `androidPackage` / Play URL. Update CTA opens the platform store listing.

Copy: `headers.storeUpdateMessage` / `storeUpdateAction` in locale packs.

## Updating content without an app store release

1. Publish updated JSON/assets to the static CDN (via the website pipeline).
2. Bump the gist **version** so clients refetch on next cold start.
3. Users open the app → splash `init` / `syncVersion` sees new version → refresh cache.

App binary updates are only required when **code**, native modules, or store metadata change.

## Seed JSON maintenance

When CDN shape changes in a breaking way:

1. Update production CDN files.
2. Copy compatible snapshots into `src/assets/json/` (`config`, `en`, `bn`, `hi`) so first install / offline still works.
3. Adjust TypeScript types under `src/shared/types/` if the schema changed.
4. Extend essential tests in `src/tests/` for formatters / controller behavior.

## Privacy and external pages

Footer opens `sadhansangha.in` privacy in the browser. Prefer the live site URL for legal pages unless product decides otherwise. Mobile footer developer credit is **AstraX** (overrides CDN `footer.devName`).
