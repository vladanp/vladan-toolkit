import { showYoutubeDislikes } from '@/features/show-youtube-dislikes';
import { startShowingDislikes } from '@/features/show-youtube-dislikes/dislikes';
import { whileEnabled } from '@/lib/features';

export default defineContentScript({
  matches: ['*://www.youtube.com/*'],
  async main(ctx) {
    const stop = await whileEnabled(showYoutubeDislikes, () => startShowingDislikes());
    ctx.onInvalidated(stop);
  },
});
