// Renders Chrome Web Store images from the real extension UI into store/. Run: `pnpm store-assets`.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { build } from 'wxt';

const root = path.resolve(import.meta.dirname, '..');
const out = (name: string) => path.join(root, 'store', name);
const ext = path.join(root, '.output', 'chrome-mv3');
const icon = readFileSync(path.join(root, 'src/assets/icon.svg'), 'utf8');

await build({ root });
const context = await chromium.launchPersistentContext('', {
  channel: 'chromium',
  args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`],
});
const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
const extensionUrl = (page: string) => `chrome-extension://${new URL(worker.url()).host}/${page}`;

// The popup at 2x, to embed in the marketing screenshot.
const popupPage = await context.newPage();
await popupPage.setViewportSize({ width: 352, height: 600 });
await popupPage.goto(extensionUrl('popup.html'));
// The version label would go stale with every release.
await popupPage.addStyleTag({ content: '[data-testid="version"]{visibility:hidden}' });
const popupPng = (await popupPage.locator('main').screenshot({ scale: 'device' })).toString(
  'base64',
);
await popupPage.close();

const page = await context.newPage();
const render = async (width: number, height: number, body: string, file: string) => {
  await page.setViewportSize({ width, height });
  await page.setContent(
    `<html><body style="margin:0;width:${width}px;height:${height}px;overflow:hidden;font-family:'Segoe UI',system-ui,sans-serif;
      background:linear-gradient(135deg,#eef2ff,#dbeafe);color:#1e1b4b">${body}</body></html>`,
  );
  await page.screenshot({ path: out(file) });
};
const sizedIcon = (px: number) => icon.replace('<svg', `<svg width="${px}" height="${px}"`);

// 1. Marketing screenshot: what it does + the real popup.
await render(
  1280,
  800,
  `<div style="display:flex;align-items:center;gap:80px;height:100%;padding:0 100px;box-sizing:border-box">
     <div style="flex:1">
       ${sizedIcon(88)}
       <h1 style="font-size:52px;line-height:1.1;margin:28px 0 16px">Less noise on YouTube, Reddit and the web</h1>
       <p style="font-size:24px;line-height:1.45;margin:0;color:#3730a3">
         Skip sponsors, hide Shorts, clean up Reddit, block pop-ups and cookie banners, strip link
         tracking and spot fake urgency. Switch each tweak on or off from the toolbar.</p>
     </div>
     <img src="data:image/png;base64,${popupPng}" style="width:400px;border-radius:16px;box-shadow:0 24px 60px rgba(30,27,75,.25)">
   </div>`,
  'screenshot-1-toolkit.png',
);

// 2. Small promo tile (440x280).
await render(
  440,
  280,
  `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:14px">
     ${sizedIcon(96)}
     <div style="font-size:32px;font-weight:600">Vladan Toolkit</div>
     <div style="font-size:17px;color:#3730a3">Hide distractions. Switch each tweak on or off.</div>
   </div>`,
  'promo-small-440x280.png',
);

await context.close();
