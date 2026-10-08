import { blockNotificationPrompts } from '@/features/block-notification-prompts';
import css from '@/features/block-notification-prompts/soft-prompts.css?inline';
import { whileEnabled } from '@/lib/features';
import { shareSwitchWithPage } from '@/lib/page-switch';
import { injectStyle } from '@/lib/style';

export default defineContentScript({
  matches: ['*://*/*'],
  runAt: 'document_start',
  async main(ctx) {
    ctx.onInvalidated(shareSwitchWithPage(blockNotificationPrompts));
    const stop = await whileEnabled(blockNotificationPrompts, () =>
      injectStyle(css, blockNotificationPrompts.id),
    );
    ctx.onInvalidated(stop);
  },
});
