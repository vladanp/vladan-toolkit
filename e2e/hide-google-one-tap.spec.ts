import { expect, servePage, setFeature, test } from './fixtures';

const site = 'https://blog.example.com/';

test.beforeEach(async ({ context }) => {
  await context.route(`${site}**`, (route) => route.fulfill(servePage('google-one-tap.html')));
  await context.route('https://accounts.google.com/**', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<p>Google</p>' }),
  );
});

test('blocks one-tap prompts but keeps the sign-in button', async ({ page }) => {
  await page.goto(site);
  await expect(page.locator('body')).toHaveAttribute(
    'data-one-tap',
    'NotAllowedError: Sign-in prompt blocked by Vladan Toolkit',
  );
  await expect(page.locator('#credential_picker_container')).toBeHidden();
  await expect(page.locator('#signin-button')).toBeVisible();
});

test('the popup switch turns it off and on', async ({ context, page, extensionId }) => {
  await setFeature(context, extensionId, 'Hide "Sign in with Google" pop-ups', false);
  await page.goto(site);
  await expect(page.locator('#credential_picker_container')).toBeVisible();
  await page.waitForTimeout(500);
  await expect(page.locator('body')).not.toHaveAttribute('data-one-tap', /Vladan Toolkit/);

  await setFeature(context, extensionId, 'Hide "Sign in with Google" pop-ups', true);
  await expect(page.locator('#credential_picker_container')).toBeHidden();
});
