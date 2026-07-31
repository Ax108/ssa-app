# Testing and verify

## Commands

```bash
bun test              # Jest once (via package.json → jest)
bun run test:watch    # Watch mode
bun verify            # lint + tsc + tsc:app + test
```

`verify` is the gate to run before opening a PR or cutting a release candidate.

## Philosophy

**Essential coverage only** — controllers, storage, CDN helpers, and a few smoke locks. Do **not** grow a full screen / UI matrix. `jest.config.js` keeps a minimal suite (no coverage gates), same idea as the website’s small `src/tests/**`.

Prefer:

- Pure helpers (`formatConfig`, `assetUrl` / markdown, `oxyApi`)
- Boot (`contentController`)
- OTA / store-update helpers (`updatesController`, `storeVersion`, `storeUpdateController`)
- Thin smokes (`App`, splash brand, Satsang headings)

Avoid brittle layout snapshots and one test per component.

## What `verify` runs

1. **`lint`** — ESLint on JS/TS.
2. **`tsc`** — full TypeScript project check.
3. **`tsc:app`** — app-focused project (`tsconfig.no-tests.json`) without relying on test files for type health.
4. **`test`** — Jest via `jest-expo`.

## Where tests live

Current layout: **`src/tests/`**.

| Area | Typical files |
|------|----------------|
| Store / boot | `contentController.test.ts`, `navbarSlice.test.ts` |
| OTA / store update | `updatesController.test.ts`, `storeVersion.test.ts`, `storeUpdateController.test.ts` |
| Network / storage | `oxyApi.test.ts` (mock `fetch`), `asyncStorage.test.ts` |
| Config / markdown | `formatConfig.test.ts` (includes `sectionsFromMarkdown`) |
| Logging | `logger.test.ts` |
| UI smoke | `App.test.tsx`, `CustomSplashScreen.test.tsx`, `SatsangScreen.test.tsx` |
| Theme / nav types | `theme.test.ts`, `navTypes.test.ts` (tabs + donation stack route) |

SVG and awkward native modules are stubbed under `src/tests/__mocks__/` and `jest.setup.js` as needed.

## Writing new tests

- Prefer **pure helpers** and **controllers** over full-app snapshots.
- Add a screen test only when it locks an essential product invariant (e.g. CDN section headings render).
- Network tests mock **`global.fetch`** — there is no axios client.
- When mocking Expo modules, prefer `jest.requireActual` plus a narrow override — incomplete `expo-modules-core` mocks break the suite.
- Keep product code out of `src/tests/`; only tests and mocks belong there.

## CI expectation

GitHub Actions: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs on pushes and PRs to `main` / `develop`.

| Job | Command | Blocking |
|-----|---------|----------|
| Lint, typecheck & tests | `bun install --frozen-lockfile` then `bun verify` | Yes |
| Dependency audit | `bun audit` | No (`continue-on-error`) |

Locally, green `bun verify` is the same gate. Native builds (`android` / `ios` / EAS) are separate from this workflow.
