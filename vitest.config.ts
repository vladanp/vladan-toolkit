import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing/vitest-plugin';

export default defineConfig({
  // WxtVitest provides WXT auto imports and an in memory fake `browser` API.
  plugins: [WxtVitest()],
  test: {
    // Node by default; DOM tests opt in with a `// @vitest-environment happy-dom` first line.
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
    setupFiles: ['./vitest.setup.ts'],
    // Process CSS so `?inline` imports return real stylesheets.
    css: true,
    mockReset: true,
    restoreMocks: true,
  },
});
