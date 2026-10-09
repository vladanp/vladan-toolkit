import { skipAmpPages } from '@/features/skip-amp-pages';
import { originalPage } from '@/features/skip-amp-pages/amp';
import { whileEnabled } from '@/lib/features';

// Sites' own AMP pages (links to google.com/amp etc. are redirected by the network rules).
export default defineContentScript({
  matches: ['*://*/*'],
  runAt: 'document_end',
  async main(ctx) {
    const stop = await whileEnabled(skipAmpPages, () => {
      const original = originalPage();
      if (original) location.replace(original);
      return () => {}; // Nothing to undo.
    });
    ctx.onInvalidated(stop);
  },
});
