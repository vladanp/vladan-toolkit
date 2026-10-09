// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { type Feature, featureEnabled } from './features';
import { mainWorldSwitch } from './main-world';
import { shareSwitchWithPage } from './page-switch';

const feature: Feature = {
  id: 'test-page',
  name: 'Test',
  description: 'For tests',
  group: 'All websites',
  enabledByDefault: true,
};
const settle = () => new Promise((resolve) => setTimeout(resolve, 10));

describe('page world switch', () => {
  it('reaches a page script that starts first (it asks, then gets the answer)', async () => {
    const isOn = mainWorldSwitch(feature.id);
    const stop = shareSwitchWithPage(feature);
    expect(await isOn()).toBe(true);

    await featureEnabled(feature).setValue(false);
    await settle();
    expect(await isOn()).toBe(false);
    stop();
  });

  it('reaches a page script that starts later', async () => {
    await featureEnabled(feature).setValue(false);
    const stop = shareSwitchWithPage(feature);
    await settle();
    const isOn = mainWorldSwitch(feature.id);
    expect(await isOn()).toBe(false);
    stop();
  });

  it('ignores other features and answers "off" when nobody replies', async () => {
    const isOn = mainWorldSwitch('nobody-shares-this', document, 20);
    document.dispatchEvent(new CustomEvent('vladan-toolkit:switch', { detail: 'other-feature=1' }));
    expect(await isOn()).toBe(false);
  });
});
