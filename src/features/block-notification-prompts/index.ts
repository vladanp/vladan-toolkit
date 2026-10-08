import type { Feature } from '@/lib/features';

export const blockNotificationPrompts = {
  id: 'block-notification-prompts',
  name: 'Decline "Allow notifications?" prompts',
  description:
    'Answers sites\' notification requests with "no" before Chrome asks you, and hides their own notification pop-ups. Sites you already allowed, and buttons you click, still work.',
  group: 'Pop-ups',
  enabledByDefault: true,
} satisfies Feature;
