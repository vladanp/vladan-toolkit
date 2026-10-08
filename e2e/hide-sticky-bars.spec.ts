import type { Page } from '@playwright/test';
import { expect, servePage, setFeature, test } from './fixtures';

const bars = ['#header', '#bottom-bar'];
const notBars = ['#sidebar', '#to-top', '#article'];

const scrollTo = (page: Page, y: number) => page.evaluate((top) => window.scrollTo(0, top), y);

test.beforeEach(async ({ context, page }) => {
  await context.route('https://news.example.com/**', (route) =>
    route.fulfill(servePage('sticky-bars.html')),
  );
  await page.goto('https://news.example.com/article');
});

test('is off by default', async ({ page }) => {
  await scrollTo(page, 1500);
  for (const selector of bars) await expect(page.locator(selector), selector).toBeVisible();
});

test('when on, hides bars while scrolled down and shows them at the top', async ({
  context,
  page,
  extensionId,
}) => {
  await setFeature(context, extensionId, 'Hide sticky headers and footers', true);
  for (const selector of bars) await expect(page.locator(selector), selector).toBeVisible();

  await scrollTo(page, 1500);
  for (const selector of bars) await expect(page.locator(selector), selector).toBeHidden();
  for (const selector of notBars) await expect(page.locator(selector), selector).toBeVisible();

  await scrollTo(page, 0);
  for (const selector of bars) await expect(page.locator(selector), selector).toBeVisible();

  await scrollTo(page, 1500);
  for (const selector of bars) await expect(page.locator(selector), selector).toBeHidden();
  await setFeature(context, extensionId, 'Hide sticky headers and footers', false);
  for (const selector of bars) await expect(page.locator(selector), selector).toBeVisible();
});
