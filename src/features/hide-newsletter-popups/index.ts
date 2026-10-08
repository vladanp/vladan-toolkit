import type { Feature } from '@/lib/features';

export const hideNewsletterPopups = {
  id: 'hide-newsletter-popups',
  name: 'Hide newsletter and sign-up pop-ups',
  description:
    'Hides pop-ups that ask for your email or offer a discount for signing up ("Get 10% off your first order"), and unlocks scrolling. Forms you open yourself stay.',
  group: 'Pop-ups',
  enabledByDefault: true,
} satisfies Feature;
