import { skipYoutubeSponsors } from '@/features/skip-youtube-sponsors';
import { startSkipping } from '@/features/skip-youtube-sponsors/skipper';
import { whileEnabled } from '@/lib/features';

export default defineContentScript({
  matches: ['*://www.youtube.com/*'],
  async main(ctx) {
    const stop = await whileEnabled(skipYoutubeSponsors, startSkipping);
    ctx.onInvalidated(stop);
  },
});
