import type { Feature } from '@/lib/features';

export const useOldReddit = {
  id: 'use-old-reddit',
  name: 'Always use old Reddit',
  description:
    'Opens Reddit pages on old.reddit.com. Reddit only allows old Reddit when you are logged in.',
  group: 'Reddit',
  enabledByDefault: false,
} satisfies Feature;
