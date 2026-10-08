# Vladan Toolkit

A personal Chrome extension that grows one feature at a time.
Built with [WXT](https://wxt.dev), React 19, TypeScript 7 and Tailwind CSS v4.

## Quick start
```bash
pnpm install   # deps + git hooks (Playwright Chromium downloads on the first `pnpm e2e`)
pnpm dev       # opens Chrome with the extension + hot reload
```

## Everyday workflow
1. Build a feature (see [CLAUDE.md](CLAUDE.md) → "Adding a feature").
2. `git commit -m "feat: ..."`. Hooks auto-format and typecheck.
3. `git push`. The pre-push hook requires a clean working tree and runs the full `pnpm verify`; GitHub CI then runs it again.
4. Merge the **Release PR** that appears on GitHub to cut a release.

## Install a build manually
Download the zip from a GitHub Release (or a CI run's artifacts) and unzip it.
Then open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the folder.

## Chrome Web Store (one-time setup)
Publishing is automatic once these are set up. Until then the publish step is skipped.
1. Register as a [Chrome Web Store developer](https://chrome.google.com/webstore/devconsole) (one-time $5 fee).
2. Upload the first zip manually to create the item, and note the **extension ID**.
3. Follow [WXT's publishing guide](https://wxt.dev/guide/essentials/publishing.html) to create OAuth credentials:
   run `pnpm wxt submit init` to obtain the client ID, client secret and refresh token (saved to the
   git-ignored `.env.submit`). Set the OAuth consent screen to **In production**, or Google expires
   the refresh token after 7 days.
4. Add the repo secrets: `gh secret set -f .env.submit`, then delete `.env.submit`.
   They are `CHROME_EXTENSION_ID`, `CHROME_CLIENT_ID`, `CHROME_CLIENT_SECRET`, `CHROME_REFRESH_TOKEN`.
