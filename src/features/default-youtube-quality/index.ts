import type { Feature } from '@/lib/features';

export const defaultYoutubeQuality = {
  id: 'default-youtube-quality',
  name: 'Default video quality',
  description:
    'Plays YouTube videos in the quality you pick (or the best below it) instead of switching automatically.',
  group: 'YouTube',
  enabledByDefault: true,
  // Values are the YouTube player's quality names.
  choice: {
    label: 'Video quality',
    options: {
      best: 'Best',
      hd2160: '2160p',
      hd1440: '1440p',
      hd1080: '1080p',
      hd720: '720p',
      large: '480p',
      medium: '360p',
    },
    default: 'hd1080',
  },
} satisfies Feature;
