import path from 'node:path';
import { type BrowserContext, test as base, chromium, type Worker } from '@playwright/test';

const extensionPath = path.resolve(import.meta.dirname, '../.output/chrome-mv3');

/** Launches Chromium with the built extension loaded (built by e2e/global-setup.ts). */
export const test = base.extend<{
  context: BrowserContext;
  serviceWorker: Worker;
  extensionId: string;
}>({
  // biome-ignore lint/correctness/noEmptyPattern: Playwright fixture signature requires destructuring.
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
    });
    await use(context);
    await context.close();
  },
  serviceWorker: async ({ context }, use) => {
    let [worker] = context.serviceWorkers();
    worker ??= await context.waitForEvent('serviceworker');
    await use(worker);
  },
  extensionId: async ({ serviceWorker }, use) => {
    await use(new URL(serviceWorker.url()).host);
  },
});

export const expect = test.expect;

/** Flips a feature's switch in the toolbar popup, like the user would. */
export async function setFeature(
  context: BrowserContext,
  extensionId: string,
  name: string,
  on: boolean,
) {
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  const toggle = popup.getByRole('switch', { name });
  await expect(toggle).toBeEnabled();
  await toggle.setChecked(on);
  await popup.close();
}

/** The bit of the extension API the tests read inside the service worker. */
type WorkerGlobals = {
  chrome: { declarativeNetRequest: { getEnabledRulesets(): Promise<string[]> } };
};

/** Waits until Chrome applies (or stops applying) a feature's network ruleset. */
export async function expectRuleset(serviceWorker: Worker, id: string, enabled: boolean) {
  await expect
    .poll(() =>
      serviceWorker.evaluate(() =>
        (globalThis as unknown as WorkerGlobals).chrome.declarativeNetRequest.getEnabledRulesets(),
      ),
    )
    .toEqual(enabled ? expect.arrayContaining([id]) : expect.not.arrayContaining([id]));
}

/** Serves an offline model of a site page (content scripts still run: the URL matches). */
export function servePage(file: string) {
  return { path: path.join(import.meta.dirname, 'fixtures', file), contentType: 'text/html' };
}
