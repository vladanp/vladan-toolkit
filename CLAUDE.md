# Vladan Toolkit — project guide

A personal Chrome extension (Manifest V3) that starts blank and grows one feature at a time.
The repo is **public** — never commit secrets, tokens, `.env` files, or personal data.

## Stack
- **WXT** (Vite-based extension framework): manifest generated from `wxt.config.ts` + `src/entrypoints/`
- **React 19** + **TypeScript 7** + **Tailwind CSS v4** (CSS-first config, `@import "tailwindcss"`)
- **Biome** (lint + format), **Vitest** (unit, with WXT fake `browser`), **Playwright** (e2e in real Chromium)
- **pnpm 12**, **lefthook** git hooks, **commitlint** (conventional commits), **release-please**

## Commands
| Command | What it does |
|---|---|
| `pnpm dev` | Opens Chrome with the extension loaded + hot reload (persistent profile in `.wxt/chrome-data`) |
| `pnpm verify` | Everything: typecheck, Biome, unit tests, build, e2e. Must be green before pushing |
| `pnpm check` | Typecheck + Biome (CI mode) |
| `pnpm lint:fix` | Auto-fix formatting/lint |
| `pnpm test` / `pnpm test:watch` | Vitest unit tests (`src/**/*.test.ts(x)`) |
| `pnpm e2e` | Playwright e2e (`e2e/*.spec.ts`); global setup installs Chromium if missing and builds + zips first |
| `pnpm build` / `pnpm zip` | Production build to `.output/chrome-mv3` / zip for the Web Store |

## Git hooks (automatic)
- **pre-commit** (fast): Biome auto-fixes staged files, typecheck.
- **commit-msg**: must be a conventional commit: `feat: ...`, `fix: ...`, `chore: ...`, `refactor: ...`, `docs: ...`, `test: ...`.
- **pre-push**: refuses if there are uncommitted/untracked files or the pushed branch isn't checked out
  (`scripts/check-push.ts`), then runs `pnpm verify`. Never bypass with `--no-verify`; fix the failure instead.

## Layout
```
src/
  entrypoints/      # WXT entrypoints -> each becomes part of the manifest
    background.ts   # service worker
    popup/          # toolbar popup (React)
  features/<name>/  # one folder per feature: logic, components, tests
  lib/              # shared helpers
e2e/                # Playwright tests + fixtures (extension loaded into Chromium)
public/icon/        # extension icons
```

## Adding a feature (the recipe)
1. **Pick where it runs**:
   - Quick UI on the toolbar icon → `src/entrypoints/popup/`
   - Persistent panel beside pages → add `src/entrypoints/sidepanel/` (index.html + main.tsx), permission `sidePanel`
   - Change/read web pages → `src/entrypoints/<name>.content.ts` (or `<name>.content/index.tsx` with `createShadowRootUi` for UI)
   - Events, alarms, context menus, keyboard commands, messaging hub → `src/entrypoints/background.ts`
   - Settings → `src/entrypoints/options/`
2. **Put the logic in `src/features/<name>/`** and keep entrypoints thin (they import from features).
3. **Permissions**: add only what the feature needs to `manifest.permissions` / `host_permissions` in `wxt.config.ts`. Prefer `activeTab` and optional permissions over broad host access.
4. **State**: use WXT storage (`import { storage } from '#imports'`, e.g. `storage.defineItem<T>('local:key', { fallback })`), not raw `localStorage`.
5. **Messaging** between contexts: `browser.runtime.sendMessage` / `onMessage` (or `@webext-core/messaging` if it grows).
6. **Tests**: unit tests next to the code (`*.test.ts`; `vitest.setup.ts` resets the fake `browser` before each test). Add/extend an e2e spec when there is UI.
7. **Verify**: `pnpm verify`, then commit with `feat: <what it does>` (this drives the version bump + changelog).

## Rules
- MV3 only; no remotely hosted code, no `eval`/`new Function` (Chrome Web Store policy).
- `browser.*` (WXT's global) instead of `chrome.*`.
- Tailwind utility classes for styling; no extra CSS frameworks.
- Keep the popup fast: no heavy work on open; defer to background where possible.
- On Windows, Playwright browsers live in `<drive>:\.cache\ms-playwright` (see `playwright.config.ts`)
  because packaged Windows apps (the Claude desktop app) redirect `%LOCALAPPDATA%` writes.

## Releasing
- Every push to `main` updates a **Release PR** (release-please). Merge it to release:
  it tags `vX.Y.Z`, writes `CHANGELOG.md`, re-runs full CI, then attaches the tested zip to the
  GitHub Release and, if the `CHROME_*` secrets are set, publishes it to the Chrome Web Store.
- Version comes from `package.json` (WXT copies it into the manifest). Don't bump it by hand.
  The Chrome Web Store rejects all-zero versions, so the project starts at `0.1.0`.
