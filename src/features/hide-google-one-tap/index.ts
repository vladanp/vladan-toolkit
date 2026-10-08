import type { Feature } from '@/lib/features';

export const hideGoogleOneTap = {
  id: 'hide-google-one-tap',
  name: 'Hide "Sign in with Google" pop-ups',
  description:
    'Stops the Google one-tap sign-in prompt that sites show on their own. "Sign in with Google" buttons still work.',
  group: 'Pop-ups',
  enabledByDefault: true,
} satisfies Feature;
