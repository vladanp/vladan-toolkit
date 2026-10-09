import type { Feature } from '@/lib/features';

export const rejectCookieBanners = {
  id: 'reject-cookie-banners',
  name: 'Reject cookie banners',
  description:
    'Automatically rejects cookie consent popups, or hides them when there is no way to reject.',
  group: 'Popups',
  enabledByDefault: true,
} satisfies Feature;
