import type { Feature } from '@/lib/features';

export const showYoutubeDislikes = {
  id: 'show-youtube-dislikes',
  name: 'Show YouTube dislikes',
  description:
    'Shows the dislike count next to the dislike button, using estimates from Return YouTube Dislike.',
  group: 'YouTube',
  enabledByDefault: true,
} satisfies Feature;
