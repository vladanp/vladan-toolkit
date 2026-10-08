import { describe, expect, it } from 'vitest';
import { siteTrackingParams, trackingParams, trackingParamsRuleset } from './rules';

const { rules } = trackingParamsRuleset;

describe('tracking parameter rules', () => {
  it('lists each parameter once', () => {
    expect(new Set(trackingParams).size).toBe(trackingParams.length);
    expect(trackingParams).toEqual(expect.arrayContaining(['utm_source', 'fbclid', 'gclid']));
  });

  it('has a rule matching each parameter right after ? or &', () => {
    const filters = rules.map((r) => r.condition.urlFilter);
    for (const param of trackingParams) expect(filters).toContain(`^${param}=`);
    for (const rule of rules) expect(rule.condition.isUrlFilterCaseSensitive).toBe(true);
  });

  it('removes every global parameter in one redirect', () => {
    for (const rule of rules) {
      expect(rule.action.type).toBe('redirect');
      if (rule.action.type !== 'redirect') continue;
      const removed = rule.action.redirect.transform?.queryTransform?.removeParams;
      expect(removed).toEqual(expect.arrayContaining(trackingParams));
    }
  });

  it('only strips site-specific parameters on those sites', () => {
    for (const site of siteTrackingParams) {
      for (const param of site.params) {
        expect(trackingParams).not.toContain(param);
        const rule = rules.find((r) => r.condition.urlFilter === `^${param}=`);
        expect(rule?.condition.requestDomains).toEqual(site.domains);
      }
    }
  });
});
