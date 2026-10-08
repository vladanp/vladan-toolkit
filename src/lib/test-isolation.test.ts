import { describe, expect, it } from 'vitest';

// Guards vitest.setup.ts: extension state must not leak between tests (tests run in order).
describe('fake browser isolation', () => {
  it('writes to storage', async () => {
    await browser.storage.local.set({ leaked: true });
    expect(await browser.storage.local.get('leaked')).toEqual({ leaked: true });
  });

  it('starts the next test with empty storage', async () => {
    expect(await browser.storage.local.get('leaked')).toEqual({});
  });
});
