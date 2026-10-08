import type { Feature } from '@/lib/features';

export const removeTrackingParams = {
  id: 'remove-tracking-params',
  name: 'Remove tracking from links',
  description:
    'Strips tracking parameters such as utm_source and fbclid from web addresses before pages load.',
  group: 'All websites',
  enabledByDefault: true,
} satisfies Feature;
