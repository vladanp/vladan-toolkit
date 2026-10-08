# Chrome Web Store listing kit

Everything to paste into the [developer dashboard](https://chrome.google.com/webstore/devconsole/6088a562-b69d-4e8a-bde9-8b9eb736f10a/ifcagkojnmahlcekjoemogpnjjpnemel/edit).
Images are in this folder; regenerate them with `pnpm store-assets`. Update this file when features change.

## Store listing tab

**Description** (the summary line comes from the manifest automatically):

```
Vladan Toolkit removes distractions and tracking from the websites you use. Every tweak is optional: switch it on or off from the toolbar popup or the settings page, and changes apply instantly to open tabs.

YouTube
• Hide YouTube Shorts: Shorts shelves, Shorts in the home feed, subscriptions, search and the video sidebar, Shorts on channel pages, and the Shorts menu entries. Regular videos are left untouched.
• Hide watched videos in Subscriptions: videos you've started or finished disappear from your Subscriptions feed.
• Skip sponsors: skips sponsor segments, self-promotion, subscribe reminders and intros, with an Undo button. Segment data comes from the community-run SponsorBlock project (sponsor.ajay.app, CC BY-NC-SA 4.0), looked up privately: only a short hash prefix of the video id is sent.

Reddit
• Reddit cleaner: hides promoted posts and other ads, awards, and "Trending today" in search, on new and old Reddit.
• Always use old Reddit (off by default): opens Reddit pages on old.reddit.com.

All websites
• Reject cookie banners: rejects cookie consent pop-ups, or hides them when there is no way to reject. Uses DuckDuckGo's open-source autoconsent rules, bundled in the extension.
• Remove tracking from links: strips utm_source, fbclid, gclid and other tracking parameters from web addresses before pages load.

Privacy: the extension collects no data. It stores only your on/off choices, synced with your Chrome profile. No analytics, no tracking, no remote code.

Open source: https://github.com/vladanp/vladan-toolkit
```

| Field | Value |
|---|---|
| Category | Functionality & UI |
| Language | English |
| Store icon | comes from the package (128px) |
| Screenshot | `screenshot-1-toolkit.png` (1280x800) |
| Small promo tile | `promo-small-440x280.png` |
| Homepage URL | https://github.com/vladanp/vladan-toolkit |
| Support URL | https://github.com/vladanp/vladan-toolkit/issues |

## Privacy tab

**Single purpose description:**

```
Cleans up the websites the user visits: removes distractions (YouTube Shorts, watched videos, sponsor segments, Reddit ads and awards), cookie consent pop-ups and link tracking parameters. Each customization can be switched on or off in the extension's settings.
```

**Permission justifications:**

| Permission | Justification |
|---|---|
| `storage` | `Saves the user's on/off choice for each feature in chrome.storage.sync. Nothing else is stored.` |
| `scripting` | `The cookie banner feature runs a few small functions bundled with the extension (from DuckDuckGo's open-source autoconsent library) in the page, to reject a consent pop-up through the consent manager's own API when it can't be done by clicking. No remote or user-provided code is run.` |
| `declarativeNetRequestWithHostAccess` | `Removes tracking parameters (utm_source, fbclid, ...) from web addresses before pages load, and, only if the user turns it on, opens Reddit pages on old.reddit.com. Both use static rules bundled with the extension.` |
| Host permission (all websites) | `Cookie consent pop-ups and link tracking parameters appear on any website, so the cookie banner script and the tracking parameter rules need to run on all sites. The extension does not read, collect or transmit page content. YouTube and Reddit features run only on youtube.com and reddit.com.` |

**Remote code:** `No, I am not using remote code.`

**Data usage:** tick **none** of the data types, then tick all three certifications
(not sold to third parties; not used for unrelated purposes; not used for creditworthiness/lending).
(The SponsorBlock lookup sends only a 4-character hash prefix of a YouTube video id, which can't identify the
video or the user; it's described in the privacy policy.)

**Privacy policy URL:** `https://github.com/vladanp/vladan-toolkit/blob/main/PRIVACY.md`

## Distribution tab

| Field | Value |
|---|---|
| Visibility | **Unlisted** (installable via link, not searchable) — or Public / Private |
| Regions | All regions |
| Payment | Free |

Click **Save draft** on each tab. Don't click "Submit for review": merging the GitHub Release PR uploads the
tested build and submits it automatically (once `CWS_PUBLISH` is on).
