// Renders src/assets/icon.svg to public/icon/<size>.png. Run after editing the SVG: `pnpm icons`.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const root = path.resolve(import.meta.dirname, '..');
const svg = readFileSync(path.join(root, 'src/assets/icon.svg'), 'utf8');

// Canvas size → artwork size. Chrome Web Store: the 128px icon is 96px artwork + 16px transparent
// padding; icons at toolbar size use (nearly) the full canvas to stay legible.
const sizes = { 16: 16, 32: 30, 48: 44, 96: 72, 128: 96 };

const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage();
for (const [canvas, art] of Object.entries(sizes)) {
  const px = Number(canvas);
  await page.setViewportSize({ width: px, height: px });
  await page.setContent(
    `<body style="margin:0;display:grid;place-items:center;width:${px}px;height:${px}px">` +
      `${svg.replace('<svg', `<svg width="${art}" height="${art}"`)}</body>`,
  );
  await page.screenshot({
    path: path.join(root, 'public/icon', `${px}.png`),
    omitBackground: true,
  });
}
await browser.close();
