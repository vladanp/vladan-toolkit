import type { Feature } from '@/lib/features';

export const hideNewsletterPopups = {
  id: 'hide-newsletter-popups',
  name: 'Hide newsletter and signup popups',
  description:
    'Hides popups that ask for your email or offer a discount for signing up ("Get 10% off your first order"), and unlocks scrolling. Forms you open yourself stay.',
  group: 'Popups',
  enabledByDefault: true,
} satisfies Feature;
