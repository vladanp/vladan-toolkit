# Vladan Toolkit

A personal Chrome extension that grows one feature at a time. Every feature can be switched on/off
from the toolbar popup or the settings page.
Built with [WXT](https://wxt.dev), React 19, TypeScript 7 and Tailwind CSS v4.

## Features
| Site | Feature | What it does | Default |
|---|---|---|---|
| YouTube | Hide YouTube Shorts | Hides Shorts shelves, Shorts in feeds and search, and the Shorts menu entries and tab | On |
| YouTube | Hide watched videos in Subscriptions | Hides videos you've started or finished (red progress bar) from the Subscriptions feed | On |
| YouTube | Skip sponsors in YouTube videos | Skips sponsor segments, self-promotion, subscribe reminders and intros, with an Undo notice. Segment data from [SponsorBlock](https://sponsor.ajay.app) (CC BY-NC-SA 4.0), looked up privately by hash prefix | On |
| Reddit | Reddit cleaner | Hides promoted posts and other ads, awards, and "Trending today" in search (new and old Reddit) | On |
| Reddit | Always use old Reddit | Opens Reddit pages on old.reddit.com (Reddit requires being logged in for old Reddit; links clicked on old Reddit still reach new Reddit) | Off |
| All websites | Reject cookie banners | Rejects cookie consent pop-ups, or hides them when there is no way to reject (DuckDuckGo's [autoconsent](https://github.com/duckduckgo/autoconsent), MPL-2.0) | On |
| All websites | Remove tracking from links | Strips `utm_*`, `fbclid`, `gclid` and other tracking parameters from addresses before pages load | On |

## Quick start
```bash
pnpm install   # deps + git hooks (Playwright Chromium downloads on the first `pnpm e2e`)
pnpm dev       # opens Chrome with the extension + hot reload
```

## Everyday workflow
1. Build a feature (see [CLAUDE.md](CLAUDE.md) → "Adding a feature").
2. `git commit -m "feat: ..."`. Hooks auto-format and typecheck.
3. `git push`. The pre-push hook requires a clean working tree and runs the full `pnpm verify`;
   GitHub CI then runs it again.
4. Merge the **Release PR** that appears on GitHub to cut a release.

## Install a build manually
- From a **GitHub Release**: download the `...-chrome.zip` asset and unzip it.
- From a **CI run's artifacts**: the download is a zip that *contains* the `...-chrome.zip`; unzip both.
- Or build locally: `pnpm build` → `.output/chrome-mv3`.

Then open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the folder.

## Chrome Web Store (one-time setup)
Publishing is automatic once this is set up. Until then the publish step is skipped.
1. Register as a [Chrome Web Store developer](https://chrome.google.com/webstore/devconsole) (one-time $5 fee).
2. Upload the first zip manually as a draft. The dashboard URL then shows both IDs you need:
   `devconsole/<publisher-id>/<extension-id>/...`.
3. Complete the item in the dashboard, or API publishing fails: **Store listing** (description, category,
   screenshots), **Privacy** (single purpose, permission justifications, data usage), and **Distribution**
   (visibility: Public, Unlisted or Private). All texts and images are ready in [store/](store/LISTING.md);
   privacy policy: [PRIVACY.md](PRIVACY.md).
4. Create a service account for the Chrome Web Store API (v2) following
   [Google's guide](https://developer.chrome.com/docs/webstore/service-accounts); under
   "Obtain access tokens" use "Use a JSON Web Token" and stop after downloading the JSON key.
   Add the service account's email under **Account** in the developer dashboard.
5. Run `pnpm wxt submit init`, choose **v2**, and enter the IDs plus `client_email` and `private_key`
   from the JSON key. It writes the git-ignored `.env.submit`. Answer **yes** to "cancel pending review",
   so a new release can replace one that is still in review.
6. Store it as a secret of the GitHub environment `chrome-web-store` (restricted to `main`):
   - bash/cmd: `gh secret set CHROME_SUBMIT_ENV --env chrome-web-store < .env.submit`
   - PowerShell: `cmd /c "gh secret set CHROME_SUBMIT_ENV --env chrome-web-store < .env.submit"`
7. Delete `.env.submit`, any `.env.submit.backup-*` files, and the JSON key.
8. Check it: Actions → **Release** → Run workflow with "dry run" ticked.
9. Turn publishing on: `gh variable set CWS_PUBLISH --body true`. Until then, releases only create the
   GitHub Release with the zip.

The old client-ID/refresh-token API (v1.1) stops working on October 15th, 2026, so don't use it.
