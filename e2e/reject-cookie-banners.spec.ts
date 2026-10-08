import { expect, servePage, setFeature, test } from './fixtures';

const site = 'https://shop.example.com/';

test.beforeEach(async ({ context }) => {
  await context.route(`${site}**`, (route) => route.fulfill(servePage('cookie-banner.html')));
});

test('rejects the cookie banner and leaves other dialogs alone', async ({ page }) => {
  await page.goto(site);
  await expect(page.locator('body')).toHaveAttribute('data-consent', 'denied');
  await expect(page.locator('#cookie-banner')).toBeHidden();
  await expect(page.locator('#friend-request')).toBeVisible();
  await expect(page.locator('body')).not.toHaveAttribute('data-friend', /.*/);
});

test('when switched off, the banner stays; switching on rejects it live', async ({
  context,
  page,
  extensionId,
}) => {
  await setFeature(context, extensionId, 'Reject cookie banners', false);
  await page.goto(site);
  await expect(page.locator('#cookie-banner')).toBeVisible();
  await page.waitForTimeout(1500); // Give it a chance to (wrongly) act.
  await expect(page.locator('body')).not.toHaveAttribute('data-consent', /.*/);

  await setFeature(context, extensionId, 'Reject cookie banners', true);
  await expect(page.locator('body')).toHaveAttribute('data-consent', 'denied');
  await expect(page.locator('#cookie-banner')).toBeHidden();
});
