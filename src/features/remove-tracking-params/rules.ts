// Imported by wxt.config.ts at build time: keep imports type only.
import type { Rule, Ruleset } from '@/lib/rulesets';

/**
 * Query parameters that only identify where a click came from. Exact names (case sensitive);
 * nothing a site needs to work.
 */
export const trackingParams = [
  // Campaign tags (Google Analytics and everyone copying it)
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'utm_name',
  'utm_cid',
  'utm_reader',
  'utm_referrer',
  'utm_social',
  'utm_social-type',
  'utm_brand',
  'utm_place',
  'utm_pubreferrer',
  'utm_swu',
  'utm_viz_id',
  'utm_source_platform',
  'utm_creative_format',
  'utm_marketing_tactic',
  // Ad click ids
  'gclid',
  'gclsrc',
  'dclid',
  'gbraid',
  'wbraid',
  'gad_source',
  'gad_campaignid',
  '_gl',
  'fbclid',
  'msclkid',
  'twclid',
  'ttclid',
  'li_fat_id',
  'igshid',
  'igsh',
  'yclid',
  'ysclid',
  'epik',
  'srsltid',
  'rb_clickid',
  'wickedid',
  // Email and marketing automation
  'mc_cid',
  'mc_eid',
  '_hsenc',
  '_hsmi',
  '__hssc',
  '__hstc',
  '__hsfp',
  'hsCtaTracking',
  'mkt_tok',
  'vero_conv',
  'vero_id',
  'oly_anon_id',
  'oly_enc_id',
  '_kx',
  'ml_subscriber',
  'ml_subscriber_hash',
  's_cid',
  '_openstat',
  // Share link referrers
  'ref_src',
  'ref_url',
];

/** Parameters that are tracking only on specific sites (elsewhere the same name can mean something). */
export const siteTrackingParams: { domains: string[]; params: string[] }[] = [
  // Share links: "?si=…" identifies who shared.
  { domains: ['youtube.com', 'youtu.be', 'open.spotify.com'], params: ['si'] },
  { domains: ['x.com', 'twitter.com'], params: ['s', 't'] },
  { domains: ['tiktok.com'], params: ['_r', '_t', 'is_from_webapp', 'sender_device'] },
];

// One rule per parameter, matching it right after "?" or "&" ("^" = a separator character).
// Each removes all tracking parameters at once, so a URL needs a single redirect.
const rules: Rule[] = [];
const addRules = (params: string[], removeParams: string[], requestDomains?: string[]) => {
  for (const param of params) {
    rules.push({
      id: rules.length + 1,
      priority: 1,
      action: { type: 'redirect', redirect: { transform: { queryTransform: { removeParams } } } },
      condition: {
        urlFilter: `^${param}=`,
        isUrlFilterCaseSensitive: true,
        ...(requestDomains && { requestDomains }),
        resourceTypes: ['main_frame', 'sub_frame'],
      },
    });
  }
};
addRules(trackingParams, trackingParams);
for (const site of siteTrackingParams) {
  addRules(site.params, [...trackingParams, ...site.params], site.domains);
}

export const trackingParamsRuleset: Ruleset = { id: 'remove-tracking-params', rules };
