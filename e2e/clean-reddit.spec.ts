import type { Page } from '@playwright/test';
import { expect, servePage, setFeature, test } from './fixtures';

const sites = {
  'new Reddit': {
    url: 'https://www.reddit.com/',
    page: 'reddit.html',
    hidden: [
      '#ad-post',
      '#dynamic-ad',
      '#comments-ad',
      '#comment-tree-ad',
      '#sidebar-ad',
      '#post-award',
      '#comment-award',
      '#trending', // Inside the search box's shadow root (Playwright locators pierce it).
    ],
    kept: [
      '#post',
      '#comments-button',
      '#share-button',
      '#comment',
      '#reply-button',
      '#sidebar-community',
      '#typeahead',
    ],
  },
  'old Reddit': {
    url: 'https://old.reddit.com/',
    page: 'old-reddit.html',
    hidden: [
      '#trending-subreddits',
      '#sidebar-ad',
      '#siteTable_organic',
      '#promoted-post',
      '#awardings',
      '#gilded',
      '#give-award',
    ],
    kept: ['#post', '#comments-link', '#share-link', '#sidebar-box'],
  },
};

const expectCleaned = async (page: Page, hidden: string[], kept: string[]) => {
  for (const selector of hidden) await expect(page.locator(selector), selector).toBeHidden();
  for (const selector of kept) await expect(page.locator(selector), selector).toBeVisible();
};

for (const [name, site] of Object.entries(sites)) {
  test(`hides ads, awards and trending on ${name}, and nothing else`, async ({ context, page }) => {
    await context.route(`${site.url}**`, (route) => route.fulfill(servePage(site.page)));
    await page.goto(site.url);
    await expectCleaned(page, site.hidden, site.kept);
  });
}

test('the popup switch turns it off and on live', async ({ context, page, extensionId }) => {
  const site = sites['new Reddit'];
  await context.route(`${site.url}**`, (route) => route.fulfill(servePage(site.page)));
  await page.goto(site.url);
  await expectCleaned(page, site.hidden, site.kept);

  await setFeature(context, extensionId, 'Reddit cleaner', false);
  for (const selector of site.hidden) await expect(page.locator(selector), selector).toBeVisible();

  await setFeature(context, extensionId, 'Reddit cleaner', true);
  await expectCleaned(page, site.hidden, site.kept);
});
