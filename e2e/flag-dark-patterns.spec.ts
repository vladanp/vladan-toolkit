import { expect, servePage, setFeature, test } from './fixtures';

const flagged = {
  '#low-stock': 'scarcity',
  '#viewers': 'scarcity',
  '#sale-countdown': 'countdown',
};
const untouched = ['#price', '#in-stock', '#game-clock', '#sale-uptime', '#add-to-cart'];
const attribute = 'data-vladan-toolkit-pressure';

test.beforeEach(async ({ context, page }) => {
  await context.route('https://shop.example.com/**', (route) =>
    route.fulfill(servePage('dark-patterns.html')),
  );
  await page.goto('https://shop.example.com/shoes');
});

test('flags stock warnings and sales countdowns, and nothing else', async ({ page }) => {
  for (const [selector, kind] of Object.entries(flagged)) {
    await expect(page.locator(selector), selector).toHaveAttribute(attribute, kind);
  }
  await page.waitForTimeout(1500); // Let the other clocks tick too.
  for (const selector of untouched) {
    await expect(page.locator(selector), selector).not.toHaveAttribute(attribute, /.*/);
  }
  // Still readable, just deemphasized, with an explanation on hover.
  await expect(page.locator('#low-stock')).toBeVisible();
  await expect(page.locator('#low-stock')).toHaveAttribute('title', /common way to rush you/);
});

test('leaves pages that sell nothing alone', async ({ context, page }) => {
  // A forum thread: the same words in a comment, and a quiz timer ticking down.
  await context.route('https://forum.example.com/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: `<h1>Collectors forum</h1><p id="comment">Only 2 left in my collection, selling fast to friends!</p>
        <div id="quiz">Time left: <span>00:00:30</span></div><button>Reply</button>
        <script>let t = 30; setInterval(() => { document.querySelector('#quiz span').textContent = '00:00:' + String(--t).padStart(2, '0'); }, 300);</script>`,
    }),
  );
  await page.goto('https://forum.example.com/thread');
  await page.waitForTimeout(1500);
  await expect(page.locator(`[${attribute}]`)).toHaveCount(0);
});

test('the popup switch removes and restores the marks live', async ({
  context,
  page,
  extensionId,
}) => {
  await expect(page.locator('#sale-countdown')).toHaveAttribute(attribute, 'countdown');
  await setFeature(context, extensionId, 'Dark pattern detector', false);
  for (const selector of Object.keys(flagged)) {
    await expect(page.locator(selector), selector).not.toHaveAttribute(attribute, /.*/);
  }
  await expect(page.locator('#low-stock')).not.toHaveAttribute('title', /.*/);

  await setFeature(context, extensionId, 'Dark pattern detector', true);
  for (const [selector, kind] of Object.entries(flagged)) {
    await expect(page.locator(selector), selector).toHaveAttribute(attribute, kind);
  }
});
