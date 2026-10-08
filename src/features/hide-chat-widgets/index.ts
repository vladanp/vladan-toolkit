import type { Feature } from '@/lib/features';

export const hideChatWidgets = {
  id: 'hide-chat-widgets',
  name: 'Hide chat widgets',
  description:
    'Hides "Chat with us" bubbles and support chat pop-ups (Intercom, Drift, Zendesk and more).',
  group: 'Pop-ups',
  enabledByDefault: true,
} satisfies Feature;
