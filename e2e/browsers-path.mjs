import path from 'node:path';

/**
 * Keep Playwright browsers inside the project (git-ignored via node_modules) instead of the
 * per-user cache. Packaged Windows apps (e.g. the Claude desktop app) redirect writes to
 * %LOCALAPPDATA%, which breaks launching a browser installed there.
 */
process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve(
  import.meta.dirname,
  '../node_modules/.cache/ms-playwright',
);
