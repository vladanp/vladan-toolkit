import type { Feature } from '@/lib/features';

export const hideStickyBars = {
  id: 'hide-sticky-bars',
  name: 'Hide sticky headers and footers',
  description:
    'Hides bars stuck to the top or bottom of the screen while you scroll down a page; they come back at the top.',
  group: 'Popups',
  // Changes how nearly every site looks, so it's off by default.
  enabledByDefault: false,
} satisfies Feature;
