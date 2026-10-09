import type { BrowserContext, Page } from '@playwright/test';
import { expect, serveYoutubeWatchPage, setFeature, test } from './fixtures';

/** Picks a video quality in the toolbar popup, like the user would. */
async function pickQuality(context: BrowserContext, extensionId: string, label: string) {
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  const select = popup.getByRole('combobox', { name: 'Video quality' });
  await expect(select).toBeEnabled();
  await select.selectOption({ label });
  await popup.close();
}

/** Opens the watch page and waits until its video has loaded (when the quality gets set). */
async function openVideo(page: Page) {
  await page.goto('https://www.youtube.com/watch?v=qualityTest');
  await page
    .locator('#movie_player video')
    .evaluate(
      (video: HTMLVideoElement) =>
        video.readyState >= 1 ||
        new Promise((resolve) => video.addEventListener('loadedmetadata', resolve, { once: true })),
    );
}

/** The quality ranges the extension asked the player for. */
const qualityCalls = (page: Page) =>
  page.evaluate(() => (window as { qualityCalls?: string[] }).qualityCalls ?? []);

test.beforeEach(async ({ context }) => {
  await serveYoutubeWatchPage(context);
});

test('plays videos in 1080p by default', async ({ page }) => {
  await openVideo(page);
  await expect.poll(() => qualityCalls(page)).toContain('hd1080-hd1080');
  expect(new Set(await qualityCalls(page))).toEqual(new Set(['hd1080-hd1080']));
});

test('a new pick applies to the playing video and the next ones, capped at what the video has', async ({
  context,
  page,
  extensionId,
}) => {
  await openVideo(page);
  await pickQuality(context, extensionId, '2160p');
  await expect.poll(async () => (await qualityCalls(page)).at(-1)).toBe('hd1440-hd1440');

  await pickQuality(context, extensionId, '480p');
  await expect.poll(async () => (await qualityCalls(page)).at(-1)).toBe('large-large');

  await openVideo(page);
  await expect.poll(async () => (await qualityCalls(page)).at(-1)).toBe('large-large');
});

test('switched off, leaves the quality to YouTube', async ({ context, page, extensionId }) => {
  await setFeature(context, extensionId, 'Default video quality', false);
  await openVideo(page);
  await page.waitForTimeout(500); // The extension's script reads its settings asynchronously.
  expect(await qualityCalls(page)).toEqual([]);
});
