import { hideGoogleOneTap } from '@/features/hide-google-one-tap';
import { blockOneTap } from '@/features/hide-google-one-tap/page';
import { mainWorldSwitch } from '@/lib/main-world';

// Page world, before the page's own scripts: wraps navigator.credentials.get.
export default defineContentScript({
  matches: ['*://*/*'],
  excludeMatches: ['*://accounts.google.com/*'],
  runAt: 'document_start',
  world: 'MAIN',
  main() {
    blockOneTap(window, mainWorldSwitch(hideGoogleOneTap.id));
  },
});
