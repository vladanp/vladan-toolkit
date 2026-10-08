import { expect, test } from './fixtures';

test('popup shows a switch per feature and the version', async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  await expect(page.getByRole('heading', { name: 'Vladan Toolkit' })).toBeVisible();
  await expect(page.getByRole('switch', { name: 'Hide YouTube Shorts' })).toBeChecked();
  await expect(page.getByTestId('version')).toHaveText(/^v\d+\.\d+\.\d+$/);
});

test('settings page shares state with the popup', async ({ context, page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/options.html`);
  await expect(page.getByRole('heading', { name: 'Vladan Toolkit settings' })).toBeVisible();
  await page.getByRole('switch', { name: 'Hide YouTube Shorts' }).uncheck();

  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await expect(popup.getByRole('switch', { name: 'Hide YouTube Shorts' })).not.toBeChecked();
});
