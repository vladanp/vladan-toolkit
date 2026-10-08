import { describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { type Feature, featureEnabled } from './features';
import { syncRuleset } from './rulesets';

const feature: Feature = {
  id: 'test-rules',
  name: 'Test rules',
  description: 'For tests',
  group: 'All websites',
  enabledByDefault: true,
};

// The fake browser has no declarativeNetRequest; record what would be switched.
const updateEnabledRulesets = vi.fn(async (_options: object) => {});
Object.assign(fakeBrowser, { declarativeNetRequest: { updateEnabledRulesets } });

const settle = () => new Promise((resolve) => setTimeout(resolve, 10));

describe('syncRuleset', () => {
  it('enables the ruleset while the switch is on and follows it live', async () => {
    syncRuleset(feature);
    await settle();
    expect(updateEnabledRulesets).toHaveBeenLastCalledWith({ enableRulesetIds: ['test-rules'] });

    await featureEnabled(feature).setValue(false);
    await settle();
    expect(updateEnabledRulesets).toHaveBeenLastCalledWith({ disableRulesetIds: ['test-rules'] });

    await featureEnabled(feature).setValue(true);
    await settle();
    expect(updateEnabledRulesets).toHaveBeenLastCalledWith({ enableRulesetIds: ['test-rules'] });
  });

  it('starts disabled for features that are off by default', async () => {
    syncRuleset({ ...feature, enabledByDefault: false });
    await settle();
    expect(updateEnabledRulesets).toHaveBeenLastCalledWith({ disableRulesetIds: ['test-rules'] });
  });
});
