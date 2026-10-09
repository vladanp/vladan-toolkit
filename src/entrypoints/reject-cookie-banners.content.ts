import { rejectCookieBanners } from '@/features/reject-cookie-banners';
import { startRejecting } from '@/features/reject-cookie-banners/content';
import { whileEnabled } from '@/lib/features';

export default defineContentScript({
  matches: ['*://*/*'],
  allFrames: true, // Many consent popups live in iframes.
  runAt: 'document_start',
  async main(ctx) {
    const stop = await whileEnabled(rejectCookieBanners, () => startRejecting());
    ctx.onInvalidated(stop);
  },
});
