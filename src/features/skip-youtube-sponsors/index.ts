import type { Feature } from '@/lib/features';

export const skipYoutubeSponsors = {
  id: 'skip-youtube-sponsors',
  name: 'Skip sponsors in YouTube videos',
  description:
    'Skips sponsor segments, self-promotion, subscribe reminders and intros, using community data from SponsorBlock.',
  group: 'YouTube',
  enabledByDefault: true,
} satisfies Feature;
