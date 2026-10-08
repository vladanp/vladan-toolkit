import path from 'node:path';
import { defineConfig } from '@playwright/test';

// The Claude desktop app is a packaged Windows app: files its processes write under %LOCALAPPDATA%
// are redirected, so Chromium installed to Playwright's default cache can't launch. On Windows keep
// browsers on the project's drive instead (shared across projects, like pnpm's store).
if (process.platform === 'win32') {
  process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.join(
    path.parse(import.meta.dirname).root,
    '.cache',
    'ms-playwright',
  );
}

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
});
