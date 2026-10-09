import type { Feature } from '@/lib/features';

export const hideLinkedinPromotedPosts = {
  id: 'hide-linkedin-promoted-posts',
  name: 'Hide promoted and suggested posts',
  description:
    'Hides ads ("Promoted") and posts LinkedIn suggests from outside your network in the feed.',
  group: 'LinkedIn',
  enabledByDefault: true,
} satisfies Feature;
