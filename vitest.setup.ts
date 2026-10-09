import { beforeEach } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';

// Fresh in memory extension APIs (storage, listeners, tabs, ...) for every test.
beforeEach(() => {
  fakeBrowser.reset();
});
