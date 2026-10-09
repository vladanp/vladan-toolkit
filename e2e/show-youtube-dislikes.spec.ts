import type { Page } from '@playwright/test';
import { expect, serveYoutubeWatchPage, setFeature, test } from './fixtures';

const dislikes: Record<string, number> = { dislikeTest: 521_215, otherVideo1: 1_234 };

test.beforeEach(async ({ context, page }) => {
  await serveYoutubeWatchPage(context);
  await context.route('https://returnyoutubedislikeapi.com/votes?*', (route) => {
    const videoId = new URL(route.request().url()).searchParams.get('videoId') ?? '';
    return route.fulfill({
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ id: videoId, likes: 19_479_454, dislikes: dislikes[videoId] }),
    });
  });
  await page.goto('https://www.youtube.com/watch?v=dislikeTest');
});

const dislikeButton = (page: Page) => page.getByRole('button', { name: 'Dislike this video' });

test('shows the dislike count, also after moving on to another video', async ({ page }) => {
  await expect(dislikeButton(page)).toHaveText('👎521K');
  await expect(page.getByRole('button', { name: /^like this video/ })).toHaveText('👍 19M');

  // YouTube swaps videos without loading a new page.
  await page.evaluate(() => {
    history.pushState({}, '', '/watch?v=otherVideo1');
    document.title = 'Other video - YouTube';
  });
  await expect(dislikeButton(page)).toHaveText('👎1.2K');
});

test('switched off, shows no count; back on, shows it again', async ({
  context,
  page,
  extensionId,
}) => {
  await expect(dislikeButton(page)).toHaveText('👎521K');
  await setFeature(context, extensionId, 'Show YouTube dislikes', false);
  await expect(dislikeButton(page)).toHaveText('👎');

  await setFeature(context, extensionId, 'Show YouTube dislikes', true);
  await expect(dislikeButton(page)).toHaveText('👎521K');
});
