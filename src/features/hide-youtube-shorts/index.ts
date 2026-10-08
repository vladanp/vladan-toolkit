import type { Feature } from '@/lib/features';

export const hideYoutubeShorts = {
  id: 'hide-youtube-shorts',
  name: 'Hide YouTube Shorts',
  description:
    'Hides Shorts shelves, Shorts in feeds and search, and the Shorts menu entries and tab.',
  group: 'YouTube',
  enabledByDefault: true,
} satisfies Feature;
