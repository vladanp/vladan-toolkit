import { describe, expect, it, vi } from 'vitest';
import { type Feature, featureEnabled, whileEnabled } from './features';

const feature: Feature = {
  id: 'test-feature',
  name: 'Test feature',
  description: 'For tests',
  enabledByDefault: true,
};

// Storage change events are delivered asynchronously.
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('featureEnabled', () => {
  it('falls back to the feature default', async () => {
    expect(await featureEnabled(feature).getValue()).toBe(true);
    expect(await featureEnabled({ ...feature, enabledByDefault: false }).getValue()).toBe(false);
  });

  it('persists a user choice', async () => {
    await featureEnabled(feature).setValue(false);
    expect(await featureEnabled(feature).getValue()).toBe(false);
  });
});

describe('whileEnabled', () => {
  it('enables immediately when on, and follows the setting live', async () => {
    const disable = vi.fn();
    const enable = vi.fn(() => disable);
    await whileEnabled(feature, enable);
    expect(enable).toHaveBeenCalledTimes(1);

    await featureEnabled(feature).setValue(false);
    await settle();
    expect(disable).toHaveBeenCalledTimes(1);

    await featureEnabled(feature).setValue(true);
    await settle();
    expect(enable).toHaveBeenCalledTimes(2);
  });

  it('does nothing while off', async () => {
    await featureEnabled(feature).setValue(false);
    const enable = vi.fn(() => () => {});
    await whileEnabled(feature, enable);
    expect(enable).not.toHaveBeenCalled();
  });

  it('stop() cleans up and ignores later changes', async () => {
    const disable = vi.fn();
    const enable = vi.fn(() => disable);
    const stop = await whileEnabled(feature, enable);
    stop();
    expect(disable).toHaveBeenCalledTimes(1);

    await featureEnabled(feature).setValue(false);
    await featureEnabled(feature).setValue(true);
    await settle();
    expect(enable).toHaveBeenCalledTimes(1);
  });
});
