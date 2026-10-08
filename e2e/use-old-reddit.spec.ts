import { expect, expectRuleset, servePage, setFeature, test } from './fixtures';

test.beforeEach(async ({ context }) => {
  await context.route('https://www.reddit.com/**', (route) =>
    route.fulfill(servePage('reddit.html')),
  );
  await context.route('https://old.reddit.com/**', (route) =>
    route.fulfill(servePage('old-reddit.html')),
  );
});

test('is off by default', async ({ page, serviceWorker }) => {
  await expectRuleset(serviceWorker, 'use-old-reddit', false);
  await page.goto('https://www.reddit.com/r/pics/');
  expect(page.url()).toBe('https://www.reddit.com/r/pics/');
});

test('when switched on, opens Reddit pages on old Reddit', async ({
  context,
  page,
  extensionId,
  serviceWorker,
}) => {
  await setFeature(context, extensionId, 'Always use old Reddit', true);
  await expectRuleset(serviceWorker, 'use-old-reddit', true);

  await page.goto('https://www.reddit.com/r/pics/comments/1abcde/title/?sort=new');
  expect(page.url()).toBe('https://old.reddit.com/r/pics/comments/1abcde/title/?sort=new');

  // Pages old Reddit can't show stay on new Reddit.
  await page.goto('https://www.reddit.com/gallery/1abcde');
  expect(page.url()).toBe('https://www.reddit.com/gallery/1abcde');

  await setFeature(context, extensionId, 'Always use old Reddit', false);
  await expectRuleset(serviceWorker, 'use-old-reddit', false);
  await page.goto('https://www.reddit.com/r/pics/');
  expect(page.url()).toBe('https://www.reddit.com/r/pics/');
});

test('links clicked on old Reddit itself can still open new Reddit', async ({
  context,
  page,
  extensionId,
  serviceWorker,
}) => {
  await setFeature(context, extensionId, 'Always use old Reddit', true);
  await expectRuleset(serviceWorker, 'use-old-reddit', true);
  await page.goto('https://old.reddit.com/login/');
  // Like old Reddit's "continue without an account" link on its login wall.
  await page.evaluate(() => {
    location.href = 'https://www.reddit.com/r/pics/';
  });
  await page.waitForURL('https://www.reddit.com/r/pics/');
});
