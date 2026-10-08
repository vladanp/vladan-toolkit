import type { Page } from '@playwright/test';
import { expect, servePage, setFeature, test } from './fixtures';

const name = 'Hide newsletter and sign-up pop-ups';
const popups = ['#nl-popup', '#nl-backdrop', '#offer'];
const bodyOverflow = (page: Page) => page.evaluate(() => getComputedStyle(document.body).overflowY);

test.beforeEach(async ({ context, page }) => {
  await context.route('https://shop.example.com/**', (route) =>
    route.fulfill(servePage('newsletter.html')),
  );
  await page.goto('https://shop.example.com/');
  await expect(page.locator('body')).toHaveAttribute('data-popup-shown', 'yes');
});

test('hides sign-up pop-ups and their backdrop, and unlocks scrolling', async ({ page }) => {
  for (const selector of popups) await expect(page.locator(selector), selector).toBeHidden();
  expect(await bodyOverflow(page)).not.toBe('hidden');
  // Email fields and dialogs that aren't sign-up pop-ups stay.
  for (const selector of ['#footer-newsletter', '#signin', '#location']) {
    await expect(page.locator(selector), selector).toBeVisible();
  }
  await expect(page.locator('#cart-drawer')).not.toHaveAttribute('data-vladan-toolkit-hidden');
});

test('keeps forms the user opens', async ({ page }) => {
  await page.locator('#open-contact').click();
  await page.waitForTimeout(600); // Longer than a detection round.
  await expect(page.locator('#contact')).toBeVisible();
});

test('the popup switch brings them back and hides them again live', async ({
  context,
  page,
  extensionId,
}) => {
  await expect(page.locator('#nl-popup')).toBeHidden();
  await setFeature(context, extensionId, name, false);
  for (const selector of popups) await expect(page.locator(selector), selector).toBeVisible();
  expect(await bodyOverflow(page)).toBe('hidden');

  await setFeature(context, extensionId, name, true);
  for (const selector of popups) await expect(page.locator(selector), selector).toBeHidden();
});
