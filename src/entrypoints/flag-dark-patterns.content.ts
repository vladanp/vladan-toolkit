import { flagDarkPatterns } from '@/features/flag-dark-patterns';
import { startFlagging } from '@/features/flag-dark-patterns/detector';
import { whileEnabled } from '@/lib/features';

export default defineContentScript({
  matches: ['*://*/*'],
  async main(ctx) {
    const stop = await whileEnabled(flagDarkPatterns, () => startFlagging());
    ctx.onInvalidated(stop);
  },
});
