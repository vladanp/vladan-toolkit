import { blockNotificationPrompts } from '@/features/block-notification-prompts';
import { blockNotificationRequests } from '@/features/block-notification-prompts/page';
import { mainWorldSwitch } from '@/lib/main-world';

// Page world, before the page's own scripts: wraps Notification.requestPermission and push subscribe.
export default defineContentScript({
  matches: ['*://*/*'],
  runAt: 'document_start',
  world: 'MAIN',
  main() {
    blockNotificationRequests(window, mainWorldSwitch(blockNotificationPrompts.id));
  },
});
