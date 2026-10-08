import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing/vitest-plugin';

export default defineConfig({
  // WxtVitest provides WXT auto-imports and an in-memory fake `browser` API.
  plugins: [WxtVitest()],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    mockReset: true,
    restoreMocks: true,
  },
});
