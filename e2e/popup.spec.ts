import { expect, test } from './fixtures';

test('popup renders', async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  await expect(page.getByRole('heading', { name: 'Vladan Toolkit' })).toBeVisible();
  await expect(page.getByTestId('version')).toHaveText(/^v\d+\.\d+\.\d+$/);
});
