import type { Feature } from '@/lib/features';

export const hideWatchedSubscriptions = {
  id: 'hide-watched-subscriptions',
  name: 'Hide watched videos in Subscriptions',
  description: "Hides videos you've started or finished from your Subscriptions feed.",
  group: 'YouTube',
  enabledByDefault: true,
} satisfies Feature;
