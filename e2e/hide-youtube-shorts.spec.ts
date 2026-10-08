import path from 'node:path';
import { expect, test } from './fixtures';

const youtubePage = path.join(import.meta.dirname, 'fixtures', 'youtube.html');

const shorts = [
  '#guide-shorts',
  '#mini-guide-shorts',
  '#home-shorts-shelf',
  '#home-short',
  '#search-shorts-shelf',
  '#search-short',
  '#reel-shelf',
  '#compact-short',
  '#lockup-short',
  '#tab-shorts',
  '#grid-short',
];
const regular = [
  '#guide-home',
  '#mini-guide-home',
  '#home-news-shelf',
  '#home-video',
  '#search-video-grid',
  '#search-video',
  '#compact-video',
  '#lockup-video',
  '#tab-videos',
  '#grid-video',
];

test.beforeEach(async ({ context }) => {
  // Serve the YouTube model offline; the content script still runs because the URL matches.
  await context.route('https://www.youtube.com/**', (route) =>
    route.fulfill({ path: youtubePage, contentType: 'text/html' }),
  );
});

test('hides every kind of Shorts element and nothing else', async ({ page }) => {
  await page.goto('https://www.youtube.com/');
  for (const selector of shorts) await expect(page.locator(selector), selector).toBeHidden();
  for (const selector of regular) await expect(page.locator(selector), selector).toBeVisible();
});

test('the popup switch turns it off and on live, without reloading YouTube', async ({
  context,
  page,
  extensionId,
}) => {
  await page.goto('https://www.youtube.com/');
  await expect(page.locator('#home-shorts-shelf')).toBeHidden();

  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  const toggle = popup.getByRole('switch', { name: 'Hide YouTube Shorts' });
  await expect(toggle).toBeChecked();

  await toggle.uncheck();
  for (const selector of shorts) await expect(page.locator(selector), selector).toBeVisible();

  await toggle.check();
  for (const selector of shorts) await expect(page.locator(selector), selector).toBeHidden();
});
