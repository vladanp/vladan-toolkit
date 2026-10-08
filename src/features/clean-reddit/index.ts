import type { Feature } from '@/lib/features';

export const cleanReddit = {
  id: 'clean-reddit',
  name: 'Reddit cleaner',
  description:
    'Hides promoted posts and other ads, awards, and "Trending today" in search on Reddit.',
  group: 'Reddit',
  enabledByDefault: true,
} satisfies Feature;
