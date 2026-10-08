import { hideChatWidgets } from '@/features/hide-chat-widgets';
import css from '@/features/hide-chat-widgets/chat-widgets.css?inline';
import { whileEnabled } from '@/lib/features';
import { injectStyle } from '@/lib/style';

export default defineContentScript({
  matches: ['*://*/*'],
  runAt: 'document_start',
  async main(ctx) {
    const stop = await whileEnabled(hideChatWidgets, () => injectStyle(css, hideChatWidgets.id));
    ctx.onInvalidated(stop);
  },
});
