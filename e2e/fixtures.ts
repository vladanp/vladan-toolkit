import path from 'node:path';
import { type BrowserContext, test as base, chromium } from '@playwright/test';

const extensionPath = path.resolve(import.meta.dirname, '../.output/chrome-mv3');

/** Launches Chromium with the built extension loaded (run `pnpm build` first). */
export const test = base.extend<{ context: BrowserContext; extensionId: string }>({
  // biome-ignore lint/correctness/noEmptyPattern: Playwright fixture signature requires destructuring.
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    let [worker] = context.serviceWorkers();
    worker ??= await context.waitForEvent('serviceworker');
    await use(new URL(worker.url()).host);
  },
});

export const expect = test.expect;
