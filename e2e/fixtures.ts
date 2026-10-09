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

/** A silent 8-bit mono WAV, so the player has real media to play and seek in. */
function silentWav(seconds: number, sampleRate = 8000) {
  const samples = seconds * sampleRate;
  const wav = Buffer.alloc(44 + samples, 128); // 128 = silence for 8-bit PCM.
  wav.write('RIFF', 0);
  wav.writeUInt32LE(36 + samples, 4);
  wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16); // fmt chunk size
  wav.writeUInt16LE(1, 20); // PCM
  wav.writeUInt16LE(1, 22); // mono
  wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(sampleRate, 28); // bytes per second
  wav.writeUInt16LE(1, 32); // block align
  wav.writeUInt16LE(8, 34); // bits per sample
  wav.write('data', 36);
  wav.writeUInt32LE(samples, 40);
  return wav;
}

/** Serves the offline YouTube watch page (any video id) with its 30 s of silent media. */
export async function serveYoutubeWatchPage(context: BrowserContext) {
  await context.route('https://www.youtube.com/watch?v=*', (route) =>
    route.fulfill(servePage('youtube-watch.html')),
  );
  // Media is fetched in byte ranges; without them the player can't seek.
  const wav = silentWav(30);
  await context.route('https://www.youtube.com/test-media/silence.wav', (route) => {
    const range = /bytes=(\d+)-(\d*)/.exec(route.request().headers().range ?? '');
    const start = Number(range?.[1] ?? 0);
    const end = range?.[2] ? Number(range[2]) : wav.length - 1;
    return route.fulfill({
      status: range ? 206 : 200,
      body: wav.subarray(start, end + 1),
      contentType: 'audio/wav',
      headers: {
        'accept-ranges': 'bytes',
        ...(range && { 'content-range': `bytes ${start}-${end}/${wav.length}` }),
      },
    });
  });
}
