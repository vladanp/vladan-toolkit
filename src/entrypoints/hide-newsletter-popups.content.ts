import { hideNewsletterPopups } from '@/features/hide-newsletter-popups';
import { startHidingNewsletterPopups } from '@/features/hide-newsletter-popups/detector';
import { whileEnabled } from '@/lib/features';

export default defineContentScript({
  matches: ['*://*/*'],
  async main(ctx) {
    const stop = await whileEnabled(hideNewsletterPopups, () => startHidingNewsletterPopups());
    ctx.onInvalidated(stop);
  },
});
