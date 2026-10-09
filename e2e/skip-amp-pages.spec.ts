import { expect, expectRuleset, servePage, setFeature, test } from './fixtures';

test.beforeEach(async ({ context }) => {
  await context.route('https://news.example.com/**', (route) =>
    route.fulfill(
      servePage(
        new URL(route.request().url()).pathname.endsWith('/amp')
          ? 'amp-page.html'
          : 'news-page.html',
      ),
    ),
  );
  // Only reached when the network rules don't redirect.
  await context.route(/^https:\/\/(www\.google\.com\/amp|[^/]+\.cdn\.ampproject\.org)\//, (route) =>
    route.fulfill({ contentType: 'text/html', body: 'Not redirected' }),
  );
});

const googleAmpLink = 'https://www.google.com/amp/s/news.example.com/story/amp';
const ampCacheLink = 'https://news-example-com.cdn.ampproject.org/c/s/news.example.com/story/amp';

test('opens the normal page for AMP links and AMP pages', async ({ page, serviceWorker }) => {
  await expectRuleset(serviceWorker, 'skip-amp-pages', true);
  for (const url of [googleAmpLink, ampCacheLink, 'https://news.example.com/story/amp']) {
    await page.goto(url);
    await page.waitForURL('https://news.example.com/story');
    await expect(page.getByRole('heading')).toHaveText('Story');
  }

  // A normal page stays, even though its canonical link is another page.
  await page.goto('https://news.example.com/other');
  await page.waitForTimeout(1000); // Give a (wrong) redirect the chance to happen.
  expect(page.url()).toBe('https://news.example.com/other');
});

test('stays on the AMP page when the site sends the browser back to it', async ({
  context,
  page,
}) => {
  let normalPageVisits = 0;
  // Like a site redirecting phones to its AMP pages.
  await context.route('https://loop.example.com/story', (route) => {
    normalPageVisits++;
    return route.fulfill({
      status: 302,
      headers: { location: 'https://loop.example.com/story/amp' },
    });
  });
  await context.route('https://loop.example.com/story/amp', (route) =>
    route.fulfill(servePage('amp-page.html')),
  );

  await page.goto('https://loop.example.com/story/amp');
  await expect.poll(() => normalPageVisits).toBe(1);
  await page.waitForTimeout(1000); // A loop would keep going.
  expect(normalPageVisits).toBe(1);
  expect(page.url()).toBe('https://loop.example.com/story/amp');
});

test('switched off, leaves AMP links and pages alone', async ({
  context,
  page,
  extensionId,
  serviceWorker,
}) => {
  await setFeature(context, extensionId, 'Open original pages instead of AMP', false);
  await expectRuleset(serviceWorker, 'skip-amp-pages', false);

  await page.goto(googleAmpLink);
  await expect(page.getByText('Not redirected')).toBeVisible();
  await page.goto('https://news.example.com/story/amp');
  await page.waitForTimeout(1000);
  expect(page.url()).toBe('https://news.example.com/story/amp');
});
