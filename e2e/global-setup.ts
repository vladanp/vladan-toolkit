import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { zip } from 'wxt';

const root = path.resolve(import.meta.dirname, '..');

/**
 * Runs before every e2e session, however it is started (pnpm e2e, VS Code, CLI), so tests never
 * see a stale build: installs Chromium if missing (no-op when present), then builds + zips.
 * The zip is the exact build the tests load, so CI ships what it tested.
 */
export default async function globalSetup() {
  const cli = createRequire(import.meta.url).resolve('@playwright/test/cli');
  execFileSync(process.execPath, [cli, 'install', 'chromium', '--no-shell'], { stdio: 'inherit' });
  await zip({ root });
}
