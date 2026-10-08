import type { Feature } from '@/lib/features';

export const flagDarkPatterns = {
  id: 'flag-dark-patterns',
  name: 'Dark pattern detector',
  description:
    'Outlines and fades countdown timers and "only 2 left!" or "12 people are viewing" messages on shopping sites, so they don\'t rush you.',
  group: 'All websites',
  enabledByDefault: true,
} satisfies Feature;
