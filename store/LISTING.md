# Chrome Web Store listing kit

Everything to paste into the [developer dashboard](https://chrome.google.com/webstore/devconsole/6088a562-b69d-4e8a-bde9-8b9eb736f10a/ifcagkojnmahlcekjoemogpnjjpnemel/edit).
Images are in this folder; regenerate them with `pnpm store-assets`. Update this file when features change.

## Store listing tab

**Description** (the summary line comes from the manifest automatically):

```
Vladan Toolkit removes distractions from the websites you use. Every tweak is optional: switch it on or off from the toolbar popup or the settings page, and changes apply instantly to open tabs.

Included:
• Hide YouTube Shorts: hides Shorts shelves, Shorts in the home feed, subscriptions, search and the video sidebar, Shorts on channel pages, and the Shorts entries in the menu and channel tabs. Regular videos are left untouched.

Privacy: the extension collects no data. It only stores your on/off choices, synced with your Chrome profile. No analytics, no tracking, no remote code.

Open source: https://github.com/vladanp/vladan-toolkit
```

| Field | Value |
|---|---|
| Category | Functionality & UI |
| Language | English |
| Store icon | comes from the package (128px) |
| Screenshot | `screenshot-1-hide-shorts.png` (1280x800) |
| Small promo tile | `promo-small-440x280.png` |
| Homepage URL | https://github.com/vladanp/vladan-toolkit |
| Support URL | https://github.com/vladanp/vladan-toolkit/issues |

## Privacy tab

**Single purpose description:**

```
Removes distracting elements from websites the user visits (currently YouTube Shorts on youtube.com). Each customization can be switched on or off in the extension's settings.
```

**Permission justifications:**

| Permission | Justification |
|---|---|
| `storage` | `Saves the user's on/off choice for each feature in chrome.storage.sync. Nothing else is stored.` |
| Host permission (`www.youtube.com`, content script) | `The content script runs only on www.youtube.com to add a stylesheet that hides YouTube Shorts. It does not read, collect or transmit page content.` |

**Remote code:** `No, I am not using remote code.`

**Data usage:** tick **none** of the data types, then tick all three certifications
(not sold to third parties; not used for unrelated purposes; not used for creditworthiness/lending).

**Privacy policy URL:** `https://github.com/vladanp/vladan-toolkit/blob/main/PRIVACY.md`

## Distribution tab

| Field | Value |
|---|---|
| Visibility | **Unlisted** (installable via link, not searchable) — or Public / Private |
| Regions | All regions |
| Payment | Free |

Click **Save draft** on each tab. Don't click "Submit for review": merging the GitHub Release PR uploads the
tested build and submits it automatically.
