import type { Feature } from '@/lib/features';

export const skipAmpPages = {
  id: 'skip-amp-pages',
  name: 'Open original pages instead of AMP',
  description:
    'Takes AMP links (google.com/amp, ampproject.org and sites’ own AMP pages) to the normal page.',
  group: 'All websites',
  enabledByDefault: true,
} satisfies Feature;
