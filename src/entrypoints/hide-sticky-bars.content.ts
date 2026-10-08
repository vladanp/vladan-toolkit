import { hideStickyBars } from '@/features/hide-sticky-bars';
import { startHidingStickyBars } from '@/features/hide-sticky-bars/sticky-bars';
import { whileEnabled } from '@/lib/features';

export default defineContentScript({
  matches: ['*://*/*'],
  async main(ctx) {
    const stop = await whileEnabled(hideStickyBars, () => startHidingStickyBars());
    ctx.onInvalidated(stop);
  },
});
