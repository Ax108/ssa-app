# Architecture (code overview)

How the mobile app is structured at runtime and in source.

## High-level flow

```
index.ts
  → src/App.tsx
      → fonts (useLoadFonts) + await contentController.init()  [parallel]
      → CustomSplashScreen until fonts + contentReady + ~600ms after fonts
      → NavigationContainer (navigationRef) + NavStackMain
          → Bottom tab shell (top navbar + one nested stack)
              → home | ashram | satsang | gallery | contact
```

Content (copy, image paths, links) comes from the **same CDN** as the website, with AsyncStorage cache and bundled seed JSON as fallback. See [content-and-cdn.md](./content-and-cdn.md).

## Stack choices

| Layer | Choice | Why it matters |
|-------|--------|----------------|
| Runtime | Expo 57 + RN 0.86 | Managed native modules, prebuild |
| Navigation | React Navigation (native-stack + bottom-tabs) | Not Expo Router |
| State | Zustand + immer | Thin global store |
| Lists | FlashList (Gallery) | Performance for image grids |
| Images | `expo-image` via `ExpoImage` wrapper | Caching / CDN URLs |
| Gradients | `AppLinearGradient` | Native module or JS fallback |
| Fonts | Freeman via `expo-font` | Brand typography (`CustomText`) |
| Network | Native `fetch` via `oxyApi` | No axios / extra HTTP client |
| Dev client | `expo-dev-client` | Custom native binary required |

## Navigation model

Invariant (do not reinvent without a deliberate redesign):

```
NavigationContainer (ref = navigationRef)
└─ MainStack (headerShown: false)
   └─ bottomTab → BottomTabShell
      ├─ AppTopNavbar          ← static chrome (outside screen animation)
      └─ BottomTabs (ONE RN tab) + custom AppBottomTabBar
         └─ BottomStack → home | ashram | satsang | gallery | contact
```

The five destinations are **stack screens** behind a custom tab bar — **not** five React Navigation tab screens. Tab presses push / pop the nested stack.

Key files:

| File | Role |
|------|------|
| `src/features/navigation/NavStackMain.tsx` | Root stack + tab shell |
| `src/features/navigation/navigationRef.ts` | Container ref (top-bar back outside BottomStack) |
| `src/features/navigation/helpers/bottomStackNav.ts` | Find stack / pop / reset helpers |
| `src/features/navigation/components/BottomStack.tsx` | Nested stack of five screens |
| `src/features/navigation/components/AppBottomTabBar.tsx` | Custom tab UI (Material icon names) |
| `src/features/navigation/components/AppTopNavbar.tsx` | Brand title + back (`navigationRef.goBack`) |
| `src/features/navigation/types/nav_types.ts` | Route names / params |
| `src/shared/hooks/useNavigateTab.ts` | In-screen navigate → stack `push` / `popToTop` |

### Back / gesture behavior

- Tab presses navigate the **nested stack** (not multiple React Navigation tab indices).
- Top navbar back uses `navigationRef` (chrome sits outside BottomStack); falls back to reset Home when needed.
- **Home:** hardware back is not consumed (Android can minimize/exit).
- `app.json` sets `android.predictiveBackGestureEnabled: false`.
- Home screen: `gestureEnabled: false` where configured for swipe-back.

## App shell and splash

| Piece | Path |
|-------|------|
| Root UI / StatusBar | `src/features/app/AppRoot.tsx` |
| Splash gate | `src/App.tsx` + `CustomSplashScreen` |
| Font loading | `src/features/app/hooks/useLoadFonts.ts` |

Splash stays until **all** of:

1. Fonts loaded (`useLoadFonts`)
2. `await contentController.init()` finished → `contentReady` (local cache and/or CDN + version sync)
3. Short brand floor (~**600ms** after fonts) so a warm cache does not flash through splash

Bottom safe-area padding belongs on the **tab bar**, not as a large AppRoot bottom inset (avoids a white gap above the bar).

## State

### `navbarSlice`

Holds the active route **title** used to highlight the **custom bottom tab bar**. The top bar always shows the brand name (`Sadhan Sangha Ashram`), not the route title.

### `contentSlice` + `contentController`

| Field | Meaning |
|-------|---------|
| `loaded` | Content applied to the store (success, cache, or seed) |
| `version` | Gist-driven content version |
| `config` | Structured site config (paths, links, media ids) |
| `texts` | Localized strings (`en`) |

`contentController.init()` (awaited during splash):

1. Read AsyncStorage cache (`LOCALSTORE` keys in `src/constants/cdn.ts`).
2. **Cache miss** → `loadVersion()` (gist version + CDN `config.json` / `en.json`, then persist).
3. **Cache hit** → apply cache, then **`await syncVersion()`** (gist check; if newer, `await loadVersion()`).
4. On hard failure → bundled `src/assets/json/*` seed.

Screens read config/texts through the store; they should not hardcode long copy that already exists on the CDN. Screens do **not** fetch on navigate.

## Feature screens (summary)

| Screen | Feature folder | Notes |
|--------|----------------|-------|
| Home | `features/home` | `GurujiRow`, `HomeHero`, teasers, shared `FollowUsSection`, footer |
| Ashram | `features/ashram` | Hero → CDN markdown → album preview → Gallery CTA → Follow Us |
| Satsang | `features/satsang` | YT thumb hero + playlists + Also Available At; `sectionsFromMarkdown`; opens YouTube/Spotify externally (**no WebView iframes**) |
| Gallery | `features/gallery` | FlashList + lightbox |
| Contact | `features/contact` | Reach-us cards, map, Shiva, Follow Us, footer |

External URLs use `openExternalUrl` (`src/shared/utils/openUrl.ts`) — system browser / maps / dialer.

## Shared primitives

| Component / util | Purpose |
|------------------|---------|
| `CustomText` | Freeman + theme text styles |
| `ExpoImage` | CDN / local image loading |
| `ScreenScroll` | Consistent scroll screen wrapper |
| `SectionDivider` / `SSADivider` | Section breaks (plain / ornate SVG) |
| `FollowUsSection` | Shared social grid (Home / Ashram / Contact) |
| `AppFooterStrip` | Footer links; developer credit overridden to **AstraX** |
| `AppLinearGradient` | Gradient with native/fallback |
| `SSALogoIcon` | SVG logo |
| `formatConfig` / `assetUrl` | CDN paths, YouTube helpers, markdown (`stripBasicMarkdown`, `paragraphsFromMarkdown`, `sectionsFromMarkdown`) |
| `oxyApi` | Native `fetch` wrapper (gist + git CDN) |
| `logger` | Dev-only console; no-op in production |

## Brand / theme

- `src/constants/palette.ts` — raw colors (cream header, page beige, accent).
- `src/constants/theme.ts` — spacing / typography tokens built on palette.
- Icons in the tab bar use Material names aligned with the website (`home`, `temple-hindu`, `self-improvement`, `collections`, `alternate-email`).

## Linking / platform queries

- iOS: `LSApplicationQueriesSchemes` in `app.json` (`https`, `http`, `tel`, `mailto`).
- Android: config plugin `plugins/withAndroidLinkingQueries.js` so `Linking.canOpenURL` / intents work for http(s) and common schemes.

## Testing touchpoints

Essential coverage: AsyncStorage helpers, `oxyApi`, `contentController`, `formatConfig` / markdown helpers, theme/nav types, and light smoke screens. Not a full screen matrix — see [testing.md](./testing.md).

## Mental model for changes

1. **Copy / images / links that the website owns** → prefer CDN/config (and seed JSON), not one-off hardcodes.
2. **Chrome / navigation / native feel** → `features/navigation` + `features/app`.
3. **Reusable UI** → `shared/`.
4. **Native capability** → Expo module + `app.json` plugin + **rebuild** the dev client.
