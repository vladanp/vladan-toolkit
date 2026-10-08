import { expect, servePage, setFeature, test } from './fixtures';

const site = 'https://news.example.com/';

test.beforeEach(async ({ context }) => {
  await context.route(`${site}**`, (route) => route.fulfill(servePage('notifications.html')));
});

test('declines the request a page makes on load and hides its own prompt', async ({ page }) => {
  await page.goto(site);
  await expect(page.locator('body')).toHaveAttribute('data-on-load', 'denied');
  await expect(page.locator('#onesignal-slidedown-container')).toBeHidden();
  await expect(page.locator('#article')).toBeVisible();
  // Chrome itself was never asked, so the site has no answer stored.
  expect(await page.evaluate(() => Notification.permission)).toBe('default');
});

test('sites already allowed keep their notifications', async ({ context, page }) => {
  await context.grantPermissions(['notifications'], { origin: site });
  await page.goto(site);
  await expect(page.locator('body')).toHaveAttribute('data-on-load', 'granted');
});

test('the popup switch turns it off and on', async ({ context, page, extensionId }) => {
  await setFeature(context, extensionId, 'Decline "Allow notifications?" prompts', false);
  await page.goto(site);
  await expect(page.locator('#onesignal-slidedown-container')).toBeVisible();
  // Off: the request reaches Chrome, which records an answer (headless Chromium blocks it).
  await expect(page.locator('body')).toHaveAttribute('data-on-load', /.+/);
  expect(await page.evaluate(() => Notification.permission)).not.toBe('default');

  await setFeature(context, extensionId, 'Decline "Allow notifications?" prompts', true);
  await expect(page.locator('#onesignal-slidedown-container')).toBeHidden();
});

test('a request the user makes by clicking goes to Chrome', async ({ page }) => {
  await page.goto(site);
  await expect(page.locator('body')).toHaveAttribute('data-on-load', 'denied');
  expect(await page.evaluate(() => Notification.permission)).toBe('default');
  await page.locator('#ask').click();
  await expect(page.locator('body')).toHaveAttribute('data-on-click', /.+/);
  expect(await page.evaluate(() => Notification.permission)).not.toBe('default');
});
