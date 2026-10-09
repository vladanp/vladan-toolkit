import type { Page } from '@playwright/test';
import { expect, servePage, setFeature, test } from './fixtures';

const hidden = [
  'post-promoted',
  'post-promoted-by',
  'post-sponsored-link',
  'post-suggested',
  'classic-promoted',
  'post-late',
];
const kept = ['post-normal', 'post-company-name'];

async function expectPosts(page: Page, hiddenOnes: string[], keptOnes: string[]) {
  for (const id of hiddenOnes) await expect(page.getByTestId(id), id).toBeHidden();
  for (const id of keptOnes) await expect(page.getByTestId(id), id).toBeVisible();
}

test.beforeEach(async ({ context, page }) => {
  await context.route('https://www.linkedin.com/**', (route) =>
    route.fulfill(servePage('linkedin.html')),
  );
  await page.goto('https://www.linkedin.com/feed/');
  await expect(page.getByTestId('post-late')).toContainText('Promoted');
});

test('hides promoted and suggested posts, also ones that load later', async ({ page }) => {
  await expectPosts(page, hidden, kept);
});

test('switched off, shows every post again', async ({ context, page, extensionId }) => {
  await expectPosts(page, hidden, kept);
  await setFeature(context, extensionId, 'Hide promoted and suggested posts', false);
  await expectPosts(page, [], [...hidden, ...kept]);
});
