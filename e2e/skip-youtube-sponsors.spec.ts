import type { Page } from '@playwright/test';
import { expect, serveYoutubeWatchPage, setFeature, test } from './fixtures';

const videoId = 'sponsorTest'; // 11 characters, like real video ids.

test.beforeEach(async ({ context }) => {
  await serveYoutubeWatchPage(context);
  // SponsorBlock answers for every video sharing the hash prefix; the extension must pick ours.
  await context.route('https://sponsor.ajay.app/api/skipSegments/**', (route) =>
    route.fulfill({
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify([
        {
          videoID: 'someOtherId',
          segments: [{ segment: [0, 20], category: 'sponsor', actionType: 'skip' }],
        },
        {
          videoID: videoId,
          segments: [
            { segment: [3, 8], category: 'sponsor', actionType: 'skip', videoDuration: 30 },
            { segment: [12, 14], category: 'sponsor', actionType: 'mute', videoDuration: 30 },
          ],
        },
      ]),
    }),
  );
});

const player = (page: Page) => page.locator('#movie_player video');
const time = (page: Page) => player(page).evaluate((video: HTMLVideoElement) => video.currentTime);

/** Every position the main video jumped to (by the test, or by the extension skipping). */
const seeks = (page: Page) => page.evaluate(() => (window as { seeks?: number[] }).seeks ?? []);

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    document.addEventListener(
      'seeking',
      (event) => {
        const video = event.target as HTMLVideoElement;
        if (!video.closest('#movie_player')) return;
        const page = window as { seeks?: number[] };
        page.seeks ??= [];
        page.seeks.push(Math.round(video.currentTime));
      },
      true,
    );
  });
  await page.goto(`https://www.youtube.com/watch?v=${videoId}`);
});

/** Seeks the main video to `to` seconds (like the user dragging the seek bar) and plays it fast. */
async function playFrom(page: Page, to: number) {
  await player(page).evaluate(async (video: HTMLVideoElement, start) => {
    if (video.readyState < 1) {
      await new Promise((resolve) =>
        video.addEventListener('loadedmetadata', resolve, { once: true }),
      );
    }
    video.currentTime = start;
    video.playbackRate = 2;
    await video.play();
  }, to);
}

/** Lets playback run past the sponsor segment (3-8 s). */
const playPastSegment = (page: Page) =>
  expect.poll(() => time(page), { timeout: 10_000 }).toBeGreaterThan(8.5);

test('skips a sponsor segment, says so, and Undo goes back to it', async ({ page }) => {
  await playFrom(page, 1);
  await playPastSegment(page);
  expect(await seeks(page)).toEqual([1, 8]); // The extension jumped to the segment's end.
  const notice = page.getByRole('status');
  await expect(notice).toContainText('Skipped sponsor');

  await notice.getByRole('button', { name: 'Undo' }).click();
  await expect(notice).toBeHidden();
  await expect.poll(() => seeks(page)).toEqual([1, 8, 3]); // Back to the segment's start...
  await playPastSegment(page);
  expect(await seeks(page)).toEqual([1, 8, 3]); // ...and this time it plays through.
});

test('lets the user watch a segment they seek into', async ({ page }) => {
  await playFrom(page, 0); // Starts the segment lookup.
  await playFrom(page, 4);
  await playPastSegment(page);
  expect(await seeks(page)).toEqual([0, 4]);
  await expect(page.getByRole('status')).toHaveCount(0);
});

test('the popup switch turns skipping off and on live', async ({ context, page, extensionId }) => {
  await setFeature(context, extensionId, 'Skip sponsors in YouTube videos', false);
  await playFrom(page, 2);
  await playPastSegment(page);
  expect(await seeks(page)).toEqual([2]);
  await expect(page.getByRole('status')).toHaveCount(0);

  await setFeature(context, extensionId, 'Skip sponsors in YouTube videos', true);
  await playFrom(page, 2);
  await playPastSegment(page);
  expect(await seeks(page)).toEqual([2, 2, 8]);
  await expect(page.getByRole('status')).toContainText('Skipped sponsor');
});
