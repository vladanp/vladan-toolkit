import { hideGoogleOneTap } from '@/features/hide-google-one-tap';
import css from '@/features/hide-google-one-tap/one-tap.css?inline';
import { whileEnabled } from '@/lib/features';
import { shareSwitchWithPage } from '@/lib/page-switch';
import { injectStyle } from '@/lib/style';

export default defineContentScript({
  matches: ['*://*/*'],
  excludeMatches: ['*://accounts.google.com/*'],
  runAt: 'document_start',
  async main(ctx) {
    ctx.onInvalidated(shareSwitchWithPage(hideGoogleOneTap));
    const stop = await whileEnabled(hideGoogleOneTap, () => injectStyle(css, hideGoogleOneTap.id));
    ctx.onInvalidated(stop);
  },
});
