// Imported by wxt.config.ts at build time: keep imports type-only.
import type { Ruleset } from '@/lib/rulesets';

/** New-Reddit-only pages that old Reddit can't show; these stay on www.reddit.com. */
export const newRedditOnly =
  '^https://www\\.reddit\\.com/(media|gallery|poll|chat|notifications|settings|answers|appeal|premium|r/[^/]+/s/)';

export const oldRedditRuleset: Ruleset = {
  id: 'use-old-reddit',
  rules: [
    {
      id: 1,
      priority: 1,
      action: { type: 'redirect', redirect: { transform: { host: 'old.reddit.com' } } },
      condition: {
        requestDomains: ['www.reddit.com'],
        // Links clicked on old Reddit itself (e.g. its "continue without an account" on the login
        // page) go through, so the user can always get to new Reddit.
        excludedInitiatorDomains: ['old.reddit.com'],
        resourceTypes: ['main_frame'],
      },
    },
    {
      id: 2,
      priority: 2,
      action: { type: 'allow' },
      condition: { regexFilter: newRedditOnly, resourceTypes: ['main_frame'] },
    },
  ],
};
