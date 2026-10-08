import { hideYoutubeShorts, injectHideShortsStyle } from '@/features/hide-youtube-shorts';
import { whileEnabled } from '@/lib/features';

export default defineContentScript({
  matches: ['*://www.youtube.com/*'],
  runAt: 'document_start',
  async main(ctx) {
    const stop = await whileEnabled(hideYoutubeShorts, () => injectHideShortsStyle());
    ctx.onInvalidated(stop);
  },
});
