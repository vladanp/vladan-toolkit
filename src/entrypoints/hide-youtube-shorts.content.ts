import { hideYoutubeShorts } from '@/features/hide-youtube-shorts';
import css from '@/features/hide-youtube-shorts/hide-shorts.css?inline';
import { whileEnabled } from '@/lib/features';
import { injectStyle } from '@/lib/style';

export default defineContentScript({
  matches: ['*://www.youtube.com/*'],
  runAt: 'document_start',
  async main(ctx) {
    const stop = await whileEnabled(hideYoutubeShorts, () =>
      injectStyle(css, hideYoutubeShorts.id),
    );
    ctx.onInvalidated(stop);
  },
});
