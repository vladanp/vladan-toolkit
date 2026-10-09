// Imported by wxt.config.ts at build time: keep imports type-only.
import type { Ruleset } from '@/lib/rulesets';

/** Google's AMP viewer: google.com, .de, .co.uk, .com.au… /amp/s/<page without https://>. */
export const googleAmp =
  '^https://www\\.google\\.(?:com|[a-z]{2}|co\\.[a-z]{2}|com\\.[a-z]{2})/amp/s/(.+)$';
/** The AMP cache: <site>.cdn.ampproject.org/c/s/<page without https://> (also /v/s/ etc.). */
export const ampCache = '^https://[a-z0-9-]+\\.cdn\\.ampproject\\.org/[a-z]/s/(.+)$';

// These lead to the site's AMP page, which the content script then swaps for the normal one.
export const ampRuleset: Ruleset = {
  id: 'skip-amp-pages',
  rules: [googleAmp, ampCache].map((regexFilter, index) => ({
    id: index + 1,
    action: { type: 'redirect', redirect: { regexSubstitution: 'https://\\1' } },
    condition: { regexFilter, resourceTypes: ['main_frame'] },
  })),
};
