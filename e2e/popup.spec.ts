import { features } from '../src/features/registry';
import { expect, test } from './fixtures';

test('popup shows every feature switch, grouped by site, and the version', async ({
  page,
  extensionId,
}) => {
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  await expect(page.getByRole('heading', { name: 'Vladan Toolkit' })).toBeVisible();
  for (const feature of features) {
    const group = page.getByRole('region', { name: feature.group });
    const toggle = group.getByRole('switch', { name: feature.name });
    if (feature.enabledByDefault) await expect(toggle, feature.id).toBeChecked();
    else await expect(toggle, feature.id).not.toBeChecked();
  }
  await expect(page.getByRole('switch')).toHaveCount(features.length);
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
