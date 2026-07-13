# Content and CDN

How remote configuration, strings, and media reach the app.

## Sources of truth

| Source | Role |
|--------|------|
| Website repo `sadhan-sangha/` | Editorial content that ships to production CDN |
| CDN | `https://astrarudra.github.io/ssa-static/prod/` |
| Gist | Version bump used to invalidate cache |
| Bundled seed | `src/assets/json/config.json`, `en.json` |

Canonical site URL (privacy, etc.): `https://sadhansangha.in` (`siteUrl` in `src/constants/cdn.ts`).

## Constants

Defined in `src/constants/cdn.ts`:

| Constant | Purpose |
|----------|---------|
| `gitBase` / `gitAssetBase` | Prod static host + `assets/` prefix |
| `GIST.version` | Gist id for version file |
| `GIT.config` / `GIT.english` | Paths to `json/config.json`, `json/en.json` |
| `LOCALSTORE.config` / `LOCALSTORE.en` | AsyncStorage keys |

Asset URLs and markdown helpers live in `src/shared/utils/assetUrl.ts`; config path stamping in `formatConfig.ts`.

## Network

`src/shared/serviceCalls/oxyApi.ts` uses the platform **`fetch` API only** (no axios).

| Method | Use |
|--------|-----|
| `getGist(id, useCache?)` | Version file; `useCache: true` omits cache-buster (sync check) |
| `getGit(path)` | `config.json` / `en.json` from CDN |

## Boot sequence

Driven from `src/App.tsx` (splash gate) and implemented in `src/appStore/contentController.ts`:

1. **Fonts** load in parallel via `useLoadFonts`.
2. **`await contentController.init()`** (splash stays until this finishes):
   - Read AsyncStorage for `config` + `en`.
   - **Empty cache** → `loadVersion()`: gist version → fetch CDN JSON → persist → apply to Zustand.
   - **Cache hit** → apply cache immediately → **`await syncVersion()`** (gist; if version changed → `await loadVersion()`).
   - **Failure** → use remaining cache if any, else bundled seed JSON; still mark content ready so the UI can open offline.
3. Splash also waits a short **~600ms after fonts** (`splashMinElapsed`) for brand presence.
4. Then `AppRoot` / navigation mounts. Screens only **read** the store — they do not refetch on tab change.

Images (CDN assets, YouTube thumbnails) still load over the network through `expo-image` as views appear.

## Rendering CDN copy

CDN long-form fields often use `**Heading**` plus multi-space runs (and sometimes literal `\n`). Helpers in `assetUrl.ts`:

| Helper | Use |
|--------|-----|
| `stripBasicMarkdown` | Teasers / short strips |
| `paragraphsFromMarkdown` | Blank-line splits after strip (Ashram-style) |
| `sectionsFromMarkdown` | Bold-heading sections (Satsang body) |

## What screens should do

- Read **strings and structured sections** from `texts` / `config` in the store.
- Resolve image paths with the asset URL helpers (relative CDN paths → absolute HTTPS).
- Open external destinations with `openExternalUrl` (podcast, Amazon, maps, mailto, tel, YouTube).
- Avoid duplicating long marketing copy that already exists on the website CDN.
- Do **not** embed YouTube/Spotify WebViews for primary content — thumbnails / cards that open externally.

## Updating content without an app store release

1. Publish updated JSON/assets to the static CDN (via the website pipeline).
2. Bump the gist **version** so clients refetch on next cold start.
3. Users open the app → splash `init` / `syncVersion` sees new version → refresh cache.

App binary updates are only required when **code**, native modules, or store metadata change.

## Seed JSON maintenance

When CDN shape changes in a breaking way:

1. Update production CDN files.
2. Copy compatible snapshots into `src/assets/json/` so first install / offline still works.
3. Adjust TypeScript types under `src/shared/types/` if the schema changed.
4. Extend essential tests in `src/tests/` for formatters / controller behavior.

## Privacy and external pages

Footer and contact flows may open `sadhansangha.in` privacy (or CDN privacy JSON) in the browser. Prefer the live site URL for legal pages unless product decides otherwise. Mobile footer developer credit is **AstraX** (overrides CDN `footer.devName`).
