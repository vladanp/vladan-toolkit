import { hideWatchedSubscriptions } from '@/features/hide-watched-subscriptions';
import css from '@/features/hide-watched-subscriptions/hide-watched.css?inline';
import { whileEnabled } from '@/lib/features';
import { injectStyle } from '@/lib/style';

export default defineContentScript({
  matches: ['*://www.youtube.com/*'],
  runAt: 'document_start',
  async main(ctx) {
    // YouTube is a single-page app: the rule itself only matches on the Subscriptions page.
    const stop = await whileEnabled(hideWatchedSubscriptions, () =>
      injectStyle(css, hideWatchedSubscriptions.id),
    );
    ctx.onInvalidated(stop);
  },
});
