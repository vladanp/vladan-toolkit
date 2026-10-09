import type { Feature } from '@/lib/features';

export const hideGoogleOneTap = {
  id: 'hide-google-one-tap',
  name: 'Hide "Sign in with Google" popups',
  description:
    'Stops the Google One Tap sign in prompt that sites show on their own. "Sign in with Google" buttons still work.',
  group: 'Popups',
  enabledByDefault: true,
} satisfies Feature;
