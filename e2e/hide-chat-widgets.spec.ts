import { expect, servePage, setFeature, test } from './fixtures';

const widgets = [
  '#intercom',
  '#drift-widget',
  '#hubspot-messages-iframe-container',
  '#tawk',
  '#zendesk',
  '#jivo',
];
const content = ['#contact-section', '#chat-history'];

test.beforeEach(async ({ context, page }) => {
  await context.route('https://support.example.com/**', (route) =>
    route.fulfill(servePage('chat-widgets.html')),
  );
  await page.goto('https://support.example.com/');
});

test('hides chat widgets and nothing else', async ({ page }) => {
  for (const selector of widgets) await expect(page.locator(selector), selector).toBeHidden();
  for (const selector of content) await expect(page.locator(selector), selector).toBeVisible();
});

test('the popup switch shows and hides them live', async ({ context, page, extensionId }) => {
  await setFeature(context, extensionId, 'Hide chat widgets', false);
  for (const selector of widgets) await expect(page.locator(selector), selector).toBeVisible();

  await setFeature(context, extensionId, 'Hide chat widgets', true);
  for (const selector of widgets) await expect(page.locator(selector), selector).toBeHidden();
});
