import { hideLinkedinPromotedPosts } from '@/features/hide-linkedin-promoted-posts';
import { startHidingLinkedinPosts } from '@/features/hide-linkedin-promoted-posts/detector';
import { whileEnabled } from '@/lib/features';

export default defineContentScript({
  matches: ['*://www.linkedin.com/*'],
  async main(ctx) {
    const stop = await whileEnabled(hideLinkedinPromotedPosts, () => startHidingLinkedinPosts());
    ctx.onInvalidated(stop);
  },
});
