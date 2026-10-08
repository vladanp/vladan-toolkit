import { cleanReddit } from '@/features/clean-reddit';
import { startCleaning } from '@/features/clean-reddit/cleaner';
import { whileEnabled } from '@/lib/features';

export default defineContentScript({
  matches: ['*://www.reddit.com/*', '*://old.reddit.com/*'],
  runAt: 'document_start',
  async main(ctx) {
    const stop = await whileEnabled(cleanReddit, () => startCleaning());
    ctx.onInvalidated(stop);
  },
});
