import { expect, servePage, setFeature, test } from './fixtures';

const watched = ['#sub-watched', '#sub-watched-legacy'];
const kept = ['#sub-unwatched', '#home-watched']; // Unwatched, and watched outside Subscriptions.

test.beforeEach(async ({ context, page }) => {
  await context.route('https://www.youtube.com/feed/subscriptions', (route) =>
    route.fulfill(servePage('youtube-subscriptions.html')),
  );
  await page.goto('https://www.youtube.com/feed/subscriptions');
});

test('hides watched videos in Subscriptions only', async ({ page }) => {
  for (const selector of watched) await expect(page.locator(selector), selector).toBeHidden();
  for (const selector of kept) await expect(page.locator(selector), selector).toBeVisible();
});

test('the popup switch shows and hides them live', async ({ context, page, extensionId }) => {
  await setFeature(context, extensionId, 'Hide watched videos in Subscriptions', false);
  for (const selector of watched) await expect(page.locator(selector), selector).toBeVisible();

  await setFeature(context, extensionId, 'Hide watched videos in Subscriptions', true);
  for (const selector of watched) await expect(page.locator(selector), selector).toBeHidden();
});
